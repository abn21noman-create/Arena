// ===================================================================
// Offline mock for next/font/google — sandbox build testing only.
// -------------------------------------------------------------------
// This sandbox has no outbound network except npmjs + github, so
// `next/font/google` cannot reach fonts.googleapis.com. In `next dev`
// that is only a warning, but `next build` treats it as a hard error
// and fails the production build.
//
// On Vercel this file is never used — Google Fonts is reachable there
// and the real font files are downloaded and self-hosted as normal.
//
// Next.js supports mocking via NEXT_FONT_GOOGLE_MOCKED_RESPONSES:
//   fetch-css-from-google-fonts.js -> mockFile[url]
//   fetch-font-file.js            -> Buffer.from(url) for non-/ urls
//
// A Proxy is used instead of a hard-coded URL map so the mock keeps
// working when the font list, weights or subsets change.
// ===================================================================
"use strict";

function familyFromUrl(url) {
  // https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@600;700&display=swap
  const m = /[?&]family=([^:&]+)/.exec(url);
  if (!m) return "Mock Font";
  return decodeURIComponent(m[1].replace(/\+/g, " "));
}

// Axis spec grammar (Google Fonts css2 API):
//   family=Inter:opsz,wght@14..32,100..900     -> axis names, then tuples
//   family=Noto+Sans+Bengali:wght@600;700;800  -> several static weights
//   family=Baloo+Da+2:wght@400..800            -> one variable range
//
// Axis names and the numbers after "@" are positionally aligned, so the
// weight has to be looked up by axis name — taking the first number would
// wrongly pick up `opsz` (optical size) for fonts that declare it.
function weightFromUrl(url) {
  const axes = /[?&]family=[^:&]*:([^&]+)/.exec(url);
  if (!axes) return "400";

  const spec = axes[1];
  const at = spec.indexOf("@");
  const tuple = at === -1 ? "" : spec.slice(at + 1);
  if (!tuple) return "400";

  // A weight axis means one entry per requested style/locale, separated
  // by ";" — e.g. "0,400;0,700" (ital,wght) or "600;700" (wght only).
  const entries = tuple.split(";");
  const names = at === -1 ? [] : spec.slice(0, at).split(",");
  const wghtIndex = names.indexOf("wght");

  if (wghtIndex === -1) return "400";

  const weights = entries
    .map((entry) => entry.split(",")[wghtIndex])
    .filter(Boolean)
    .map((w) => w.trim());

  if (weights.length === 0) return "400";
  // A range (e.g. "100..900") is what variable fonts want; otherwise the
  // first static weight is enough for a build-time mock.
  return weights[0].replace("..", " ");
}

function cssFor(url) {
  const family = familyFromUrl(url);
  const weight = weightFromUrl(url);
  // The font file URL only has to end in a known extension: with the
  // mock enabled, fetchFontFile returns Buffer.from(url) and never
  // performs a real request.
  const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `/* mocked for offline builds */
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/mock/v1/${slug}.woff2) format('woff2');
}
`;
}

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop !== "string") return undefined;
      // The loader only looks up concrete font URLs, but guard against
      // misc probes (e.g. `then` when awaited, or util.inspect symbols).
      if (!prop.startsWith("http")) return undefined;
      return cssFor(prop);
    },
    has() {
      return true;
    },
  }
);
