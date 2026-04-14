// Clone an <svg> element, inject a Google-Fonts @import so the file renders
// correctly in standalone viewers, serialize, and trigger a download.
//
// Notes:
// - next/font obfuscates the CSS variable to a hashed font-family locally,
//   but the <text> elements already reference the canonical Google font name
//   (e.g. "Cormorant Garamond, serif") so the exported file is viewer-portable.
// - The @import pulls all five monogram fonts. Keep this list in sync with
//   lib/fonts.ts.

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&family=Cinzel:wght@400..900&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Playfair+Display:wght@400..900&display=swap');
`.trim();

export function downloadSvg(svg: SVGSVGElement, filename = "monogram.svg") {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Strip any placeholder groups (dashed boxes rendered for empty slots in
  // the editor — they should not appear in the exported file).
  clone
    .querySelectorAll('[data-placeholder="true"]')
    .forEach((el) => el.remove());

  // Make sure the xmlns is present so the file opens standalone.
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // Inject a <style> block with the Google Fonts @import so the exported file
  // renders the chosen typeface in any SVG viewer with internet access.
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = FONT_IMPORT;
  clone.insertBefore(style, clone.firstChild);

  const xml = new XMLSerializer().serializeToString(clone);
  const source = `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Let the browser flush the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
