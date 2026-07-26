/** Common named HTML entities from lesson CMS / Supabase content. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  ensp: "\u2002",
  emsp: "\u2003",
  thinsp: "\u2009",
  ndash: "\u2013",
  mdash: "\u2014",
  lsquo: "\u2018",
  rsquo: "\u2019",
  sbquo: "\u201A",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bdquo: "\u201E",
  dagger: "\u2020",
  Dagger: "\u2021",
  bull: "\u2022",
  hellip: "\u2026",
  permil: "\u2030",
  prime: "\u2032",
  Prime: "\u2033",
  lsaquo: "\u2039",
  rsaquo: "\u203A",
  oline: "\u203E",
  euro: "\u20AC",
  trade: "\u2122",
  larr: "\u2190",
  uarr: "\u2191",
  rarr: "\u2192",
  darr: "\u2193",
  harr: "\u2194",
  crarr: "\u21B5",
  lceil: "\u2308",
  rceil: "\u2309",
  lfloor: "\u230A",
  rfloor: "\u230B",
  loz: "\u25CA",
  spades: "\u2660",
  clubs: "\u2663",
  hearts: "\u2665",
  diams: "\u2666",
  cent: "\u00A2",
  pound: "\u00A3",
  yen: "\u00A5",
  copy: "\u00A9",
  reg: "\u00AE",
  deg: "\u00B0",
  plusmn: "\u00B1",
  para: "\u00B6",
  sect: "\u00A7",
  middot: "\u00B7",
  frac14: "\u00BC",
  frac12: "\u00BD",
  frac34: "\u00BE",
  times: "\u00D7",
  divide: "\u00F7",
  iexcl: "\u00A1",
  iquest: "\u00BF",
  not: "\u00AC",
  shy: "\u00AD",
  macr: "\u00AF",
  micro: "\u00B5",
  sup1: "\u00B9",
  sup2: "\u00B2",
  sup3: "\u00B3",
  acute: "\u00B4",
  cedil: "\u00B8",
  ordm: "\u00BA",
  ordf: "\u00AA",
  laquo: "\u00AB",
  raquo: "\u00BB",
};

function decodeNumericEntity(codePoint: number): string {
  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return "";
  }
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return "";
  }
}

/**
 * Decode HTML entities (`&rdquo;`, `&#34;`, `&#x22;`, etc.) to real characters.
 * Repeats until stable so `&amp;rdquo;` becomes `"`.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string" || !text.includes("&")) {
    return text;
  }

  let out = text;
  let prev = "";

  while (out !== prev) {
    prev = out;
    out = out
      .replace(/&#(\d+);/g, (_, dec: string) =>
        decodeNumericEntity(parseInt(dec, 10)),
      )
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
        decodeNumericEntity(parseInt(hex, 16)),
      )
      .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => {
        const decoded = NAMED_ENTITIES[name];
        return decoded !== undefined ? decoded : match;
      });
  }

  return out;
}

/**
 * Characters that must never appear in user-facing lesson copy.
 * Includes control/format chars, zero-width marks, replacement/object glyphs,
 * odd spaces, and private-use code points that often render as empty tofu boxes.
 */
const INVISIBLE_OR_BROKEN_CHAR =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u2000-\u200F\u2028-\u202E\u2060-\u206F\uFEFF\uFFF9-\uFFFD\uE000-\uF8FF]/g;

/** Replace invisible / broken characters with a normal space. */
export function stripInvisibleCharacters(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text.replace(INVISIBLE_OR_BROKEN_CHAR, " ");
}

/** Decode entities and collapse odd whitespace from CMS HTML. */
export function sanitizeDisplayText(text: string): string {
  if (!text || typeof text !== "string") return text;
  return stripInvisibleCharacters(decodeHtmlEntities(text)).replace(/\u00A0/g, " ");
}

/** Recursively sanitize all string fields in lesson JSON (steps, choices, configs). */
export function sanitizeLessonContent<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeDisplayText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLessonContent(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = sanitizeLessonContent(nested);
    }
    return out as T;
  }
  return value;
}

/**
 * Plain text for Text components — decodes entities and removes HTML tags
 * (including malformed fragments like </p<) so tags are never shown to users.
 */
export function toPlainDisplayText(text: string): string {
  if (!text || typeof text !== "string") return "";

  const decoded = sanitizeDisplayText(text);
  if (!decoded.includes("<") && !decoded.includes(">")) {
    return decoded.replace(/\s+/g, " ").trim();
  }

  let out = decoded
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/<\/[a-zA-Z]+\s*</g, " ")
    .replace(/>\s*\/[a-zA-Z]+\s*</g, " ")
    .replace(/<[^>]*>?/g, " ")
    .replace(/>\s*/g, " ");

  return out.replace(/\s+/g, " ").trim();
}
