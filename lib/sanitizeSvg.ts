// Server-side SVG sanitizer. Accepts an LLM-generated SVG fragment and
// returns a clean <g>...</g> string containing only whitelisted elements
// and attributes, with every stroked element forced to stroke="currentColor"
// and fill="none".
//
// This is intentionally strict: it uses a hand-rolled XML tokenizer so we
// don't pull in a parser that might be lenient about script-like constructs.
// The rendered output is placed into the DOM via dangerouslySetInnerHTML, so
// any slip here would be an XSS vector.

const ALLOWED_TAGS = new Set([
  "g",
  "path",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);

const ALLOWED_ATTRS = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "transform",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-width",
]);

// Attributes we always set on stroked elements regardless of what the LLM
// provided. `stroke-width` is preserved from the LLM if valid, otherwise
// defaulted to 1.2.
function forcedAttrs(strokeWidth: string | undefined): string {
  const sw = strokeWidth && /^\d+(\.\d+)?$/.test(strokeWidth) ? strokeWidth : "1.2";
  return `fill="none" stroke="currentColor" stroke-width="${sw}"`;
}

export class SanitizeError extends Error {}

export function sanitizeSvgFragment(raw: string): string {
  // 1. Strip markdown fences / code blocks, XML decls, comments, CDATA.
  let input = raw.trim();
  input = input.replace(/^```(?:xml|svg|html)?\s*/i, "");
  input = input.replace(/```$/i, "");
  input = input.replace(/<\?xml[^?]*\?>/g, "");
  input = input.replace(/<!--[\s\S]*?-->/g, "");
  input = input.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");

  // 2. If the model wrapped it in <svg>...</svg>, unwrap to the inner tree.
  const svgMatch = input.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
  if (svgMatch) input = svgMatch[1];

  input = input.trim();

  // 3. Ensure it starts with a <g> or collection of whitelisted elements.
  //    If the model returned <path> directly, wrap it ourselves.
  if (!input.startsWith("<g")) {
    input = `<g>${input}</g>`;
  }

  // 4. Tokenize.
  const out: string[] = [];
  const stack: string[] = [];

  const TAG_RE = /<\s*(\/?)\s*([A-Za-z][A-Za-z0-9]*)\b([^>]*?)(\/?)>/g;
  let match: RegExpExecArray | null;

  while ((match = TAG_RE.exec(input)) !== null) {
    const [, closing, tagName, attrsRaw, selfCloseRaw] = match;

    // Text between tags is silently dropped — none of our whitelisted
    // elements have meaningful text content.

    const tag = tagName.toLowerCase();
    const isClose = closing === "/";
    const isSelfClose = selfCloseRaw === "/" || isVoidLike(tag);

    if (!ALLOWED_TAGS.has(tag)) continue;

    if (isClose) {
      if (stack.length && stack[stack.length - 1] === tag) {
        stack.pop();
        out.push(`</${tag}>`);
      }
      continue;
    }

    const { filtered, strokeWidth } = filterAttrs(attrsRaw);

    if (tag === "g") {
      out.push(`<g${filtered}>`);
      if (!isSelfClose) stack.push("g");
      else out.push(`</g>`);
      continue;
    }

    // Leaf shape element: always force stroke/fill/stroke-width.
    out.push(`<${tag}${filtered} ${forcedAttrs(strokeWidth)} />`);
  }

  // Close any unclosed <g> elements.
  while (stack.length) {
    out.push(`</${stack.pop()}>`);
  }

  const result = out.join("");

  if (!result || !result.includes("<")) {
    throw new SanitizeError("Sanitized output is empty");
  }

  // Final safety: the result must contain at least one shape element.
  if (!/<(path|circle|ellipse|line|polyline|polygon)\b/i.test(result)) {
    throw new SanitizeError("No drawable shapes found after sanitization");
  }

  // Must not contain anything script-like.
  if (/javascript:|on[a-z]+\s*=/i.test(result)) {
    throw new SanitizeError("Sanitized output contains forbidden patterns");
  }

  return result;
}

function isVoidLike(tag: string): boolean {
  // All non-<g> whitelisted tags are leaves.
  return tag !== "g";
}

type FilteredAttrs = { filtered: string; strokeWidth: string | undefined };

function filterAttrs(raw: string): FilteredAttrs {
  const attrs: string[] = [];
  let strokeWidth: string | undefined;

  // Attribute regex: name="value" or name='value' or name=value
  const ATTR_RE = /([A-Za-z_:][A-Za-z0-9_:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? "";

    if (name.startsWith("on")) continue; // event handlers
    if (name.startsWith("xlink")) continue;
    if (name === "style") continue;
    if (name === "href") continue;
    if (name === "xmlns") continue;

    if (name === "stroke-width") {
      if (/^\d+(\.\d+)?$/.test(value)) strokeWidth = value;
      continue; // handled via forcedAttrs
    }

    if (!ALLOWED_ATTRS.has(name)) continue;

    // Value must not contain < > or javascript:
    if (/[<>]/.test(value)) continue;
    if (/javascript:/i.test(value)) continue;

    attrs.push(`${name}="${escapeAttr(value)}"`);
  }

  return {
    filtered: attrs.length ? ` ${attrs.join(" ")}` : "",
    strokeWidth,
  };
}

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
