import type { FlourishRole } from "@/components/frames/types";

const ROLE_DESCRIPTIONS: Record<FlourishRole, string> = {
  top: "crowning element sitting above the monogram, like a small wreath, laurel, or cluster of botanicals",
  bottom: "base element sitting below the monogram, like a ribbon, laurel sprig, or small floral cluster",
  left: "left-side ornament mirroring the right",
  right: "right-side ornament mirroring the left",
};

export type FlourishPromptInput = {
  role: FlourishRole;
  width: number;
  height: number;
};

export function buildFlourishPrompt({
  role,
  width,
  height,
}: FlourishPromptInput): string {
  const roleDescription = ROLE_DESCRIPTIONS[role];

  return `You are generating an SVG fragment for a decorative flourish inside a luxury heraldic crest.

STRICT OUTPUT REQUIREMENTS:
- Output a single <g>...</g> fragment only — no <svg> wrapper, no XML declaration, no markdown fences, no prose, no explanation.
- Allowed elements: <g>, <path>, <circle>, <ellipse>, <line>, <polyline>, <polygon>. NO other elements.
- Every stroked element MUST use stroke="currentColor" and fill="none". stroke-width between 0.8 and 1.6.
- Allowed attributes: d, cx, cy, r, rx, ry, x1, y1, x2, y2, points, transform, stroke-linecap, stroke-linejoin, stroke-width, stroke, fill.
- NO text, NO gradients, NO filters, NO images, NO <use>, NO <style>, NO <script>, NO external references, NO xlink.
- NO event handler attributes (onclick, onload, etc).

LAYOUT:
- Design fits inside a coordinate space of width=${width} height=${height} with 4 units of padding on every side.
- Composition is perfectly symmetrical along the vertical axis (mirror about x=${width / 2}).
- Use negative space intentionally. Do not fill every pixel.

AESTHETIC:
- Ultra-thin, crisp, precise vector linework — like a high-end editorial logo.
- Minimalist luxury heraldic crest style, black line art only.
- No hatching, no shading, no sketch marks, no texture, no multiple overlapping wobbly strokes.
- Lines should look like they were drawn with a single confident pen pass.

STYLE: delicate botanical line art — fine curved leaves, thin stems, small buds or flower centers, airy and balanced.

ROLE: ${roleDescription}.

Return ONLY the <g>...</g> fragment. Your entire response must start with "<g" and end with "</g>".`;
}
