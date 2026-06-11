import React from "react";
import { Text, useWindowDimensions, StyleSheet, TextStyle, StyleProp } from "react-native";
import RenderHtml from "react-native-render-html";
import { sanitizeDisplayText } from "../../utils/decodeHtmlEntities";

const defaultTextStyle: TextStyle = {
  fontSize: 18,
  color: "#1e355e",
  textAlign: "right",
};

const defaultTagsStyles: Record<string, TextStyle> = {
  body: defaultTextStyle,
  p: { ...defaultTextStyle, marginVertical: 4 },
  strong: { ...defaultTextStyle, fontWeight: "700" },
  b: { ...defaultTextStyle, fontWeight: "700" },
  em: { ...defaultTextStyle, fontStyle: "italic" },
  i: { ...defaultTextStyle, fontStyle: "italic" },
  br: {},
  ul: { ...defaultTextStyle, paddingRight: 16 },
  ol: { ...defaultTextStyle, paddingRight: 16 },
  li: { ...defaultTextStyle, marginVertical: 2 },
  span: defaultTextStyle,
};

function looksLikeHtml(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.includes("<") && trimmed.includes(">");
}

/** Detect malformed HTML (e.g. </p< or >/p<) that would show as raw tags when rendered. */
function looksLikeMalformedHtml(str: string): boolean {
  // Closing tag with extra <: </p<, </strong<
  if (/<\/[a-zA-Z]+\s*</.test(str)) return true;
  // Orphan > then slash and tag start: >/p<
  if (/>\s*\/\s*[a-zA-Z]+\s*</.test(str)) return true;
  // Unclosed tag at end: <p>hello (no closing) is ok for parser; <... at end with no >
  if (/<[^>]*$/.test(str) && !/>\s*$/.test(str)) return true;
  return false;
}

/** Strip all tag-like runs so no raw tags are ever shown; keep text that was inside. */
/** Remove inline colors from lesson HTML so text is visible on light buttons. */
export function stripInlineColorsFromHtml(html: string): string {
  return html
    .replace(/\s*style="([^"]*)"/gi, (_match, styles: string) => {
      const cleaned = styles
        .replace(/color\s*:\s*[^;"]+;?/gi, "")
        .replace(/background(?:-color)?\s*:\s*[^;"]+;?/gi, "")
        .trim();
      return cleaned ? ` style="${cleaned}"` : "";
    })
    .replace(/\s*color="[^"]*"/gi, "");
}

function stripTagLikeContent(str: string): string {
  let out = str;
  // Remove malformed closing tag fragments (e.g. </p<) so we keep text like "נר בריש"
  out = out.replace(/<\/[a-zA-Z]+\s*</g, "");
  // Remove orphan >/tag< fragments (e.g. >/p<)
  out = out.replace(/>\s*\/[a-zA-Z]+\s*</g, " ");
  // Remove any remaining <...> and unclosed <...
  out = out.replace(/<[^>]*>?/g, "");
  out = out.replace(/>\s*/g, " ");
  out = out.trim();
  return out.length ? out : "";
}

export interface HtmlTextProps {
  /** Raw content: plain text or HTML (e.g. `<p>...</p>`, `<strong>...</strong>`). */
  value: string;
  /** Optional base style for the container (when HTML) or Text (when plain). */
  style?: StyleProp<TextStyle>;
  /** Optional base styles for HTML tags (merged with defaults). */
  tagsStyles?: Record<string, TextStyle>;
  /** Overrides inline/HTML colors (e.g. white lesson HTML on white choice buttons). */
  contentColor?: string;
}

/**
 * Renders a string as plain Text or as HTML (bold, paragraphs, etc.).
 * Use everywhere lesson/drill text is shown so HTML tags are never visible.
 */
function withContentColor(
  tags: Record<string, TextStyle>,
  color: string,
): Record<string, TextStyle> {
  const out: Record<string, TextStyle> = {};
  for (const [key, tagStyle] of Object.entries(tags)) {
    out[key] = { ...tagStyle, color };
  }
  return out;
}

export default function HtmlText({
  value,
  style,
  tagsStyles: customTagsStyles = {},
  contentColor,
}: HtmlTextProps) {
  const { width } = useWindowDimensions();

  if (!value || typeof value !== "string") {
    return null;
  }

  const decoded = sanitizeDisplayText(value);
  const isHtml = looksLikeHtml(decoded);
  const flatStyle = StyleSheet.flatten([defaultTextStyle, style]) as TextStyle | undefined;
  const resolvedColor = contentColor ?? flatStyle?.color;

  if (!isHtml) {
    return (
      <Text style={[defaultTextStyle, style, resolvedColor ? { color: resolvedColor } : null]}>
        {decoded}
      </Text>
    );
  }

  // Malformed HTML (e.g. </p< or >/p<) would show as raw tags; strip and show plain text.
  if (looksLikeMalformedHtml(decoded)) {
    const plain = stripTagLikeContent(decoded);
    return (
      <Text style={[defaultTextStyle, style, resolvedColor ? { color: resolvedColor } : null]}>
        {plain}
      </Text>
    );
  }

  const html = stripInlineColorsFromHtml(decoded);

  let mergedTagsStyles = { ...defaultTagsStyles, ...customTagsStyles };
  if (resolvedColor) {
    mergedTagsStyles = withContentColor(mergedTagsStyles, resolvedColor);
  }
  const baseStyle = (StyleSheet.flatten([defaultTextStyle, style]) ?? defaultTextStyle) as TextStyle;
  if (resolvedColor) {
    baseStyle.color = resolvedColor;
  }

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      tagsStyles={mergedTagsStyles}
      baseStyle={baseStyle}
    />
  );
}
