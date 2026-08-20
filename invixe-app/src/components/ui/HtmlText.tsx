import React, { useMemo } from "react";
import {
  Text,
  useWindowDimensions,
  StyleSheet,
  TextStyle,
  StyleProp,
  Platform,
} from "react-native";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { sanitizeDisplayText, toPlainDisplayText } from "../../utils/decodeHtmlEntities";
import { font } from "../../theme";

const defaultTextStyle: TextStyle = {
  fontSize: 18,
  color: "#1e355e",
  textAlign: "right",
  fontFamily: font.family,
  fontWeight: "400",
};

/** Rubik bold must be applied via fontFamily — fontWeight alone inverts/breaks on Android. */
const boldTextStyle: TextStyle = {
  fontFamily: font.bold,
  // Avoid double-bold on iOS when font file is already Bold; Android needs a weight hint.
  ...(Platform.OS === "android"
    ? { fontWeight: "700" as const }
    : { fontWeight: "400" as const }),
};

const defaultTagsStyles: Record<string, TextStyle> = {
  body: defaultTextStyle,
  p: { ...defaultTextStyle, marginVertical: 4 },
  strong: { ...defaultTextStyle, ...boldTextStyle },
  b: { ...defaultTextStyle, ...boldTextStyle },
  em: { ...defaultTextStyle, fontStyle: "italic" },
  i: { ...defaultTextStyle, fontStyle: "italic" },
  br: {},
  ul: { ...defaultTextStyle, paddingRight: 16 },
  ol: { ...defaultTextStyle, paddingRight: 16 },
  li: { ...defaultTextStyle, marginVertical: 2 },
  span: defaultTextStyle,
};

const SYSTEM_FONTS = [...defaultSystemFonts, font.family, font.bold];
const EMPTY_TAGS_STYLES: Record<string, TextStyle> = {};

function looksLikeHtml(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.includes("<") && trimmed.includes(">");
}

/** Detect malformed HTML (e.g. </p< or >/p<) that would show as raw tags when rendered. */
function looksLikeMalformedHtml(str: string): boolean {
  if (/<\/[a-zA-Z]+\s*</.test(str)) return true;
  if (/>\s*\/\s*[a-zA-Z]+\s*</.test(str)) return true;
  if (/<[^>]*$/.test(str) && !/>\s*$/.test(str)) return true;
  return false;
}

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
  return toPlainDisplayText(str);
}

function htmlHasBoldMarkup(html: string): boolean {
  return /<\s*(strong|b)\b/i.test(html);
}

/**
 * Parent styles often set fontWeight 700/800 for titles. If that becomes RenderHtml
 * baseStyle while <strong> also sets weight, Android/Rubik can invert: body looks
 * bold and <strong> falls back to regular. Keep the base regular whenever bold
 * markup is present so <strong>/<b> are the only bold runs.
 */
function normalizeBaseStyleForHtml(
  style: TextStyle,
  html: string,
): TextStyle {
  const next: TextStyle = {
    ...style,
    fontFamily: style.fontFamily || font.family,
  };

  if (htmlHasBoldMarkup(html)) {
    next.fontWeight = "400";
    if (next.fontFamily === font.bold) {
      next.fontFamily = font.family;
    }
  }

  return next;
}

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

export interface HtmlTextProps {
  /** Raw content: plain text or HTML (e.g. `<p>...</p>`, `<strong>...</strong>`). */
  value: string;
  /** Optional base style for the container (when HTML) or Text (when plain). */
  style?: StyleProp<TextStyle>;
  /** Optional base styles for HTML tags (merged with defaults). */
  tagsStyles?: Record<string, TextStyle>;
  /** Overrides inline/HTML colors (e.g. white lesson HTML on white choice buttons). */
  contentColor?: string;
  /** Layout width for HTML blocks; defaults to the window width. */
  contentWidth?: number;
}

/**
 * Renders a string as plain Text or as HTML (bold, paragraphs, etc.).
 * Use everywhere lesson/drill text is shown so HTML tags are never visible.
 */
export default function HtmlText({
  value,
  style,
  tagsStyles: customTagsStyles = EMPTY_TAGS_STYLES,
  contentColor,
  contentWidth: contentWidthProp,
}: HtmlTextProps) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = contentWidthProp ?? windowWidth;

  const decoded =
    value && typeof value === "string" ? sanitizeDisplayText(value) : "";
  const isHtml = looksLikeHtml(decoded);
  const html = isHtml ? stripInlineColorsFromHtml(decoded) : decoded;
  const flatStyle = StyleSheet.flatten([defaultTextStyle, style]) as
    | TextStyle
    | undefined;
  const resolvedColor =
    contentColor ??
    (typeof flatStyle?.color === "string" ? flatStyle.color : undefined);

  const mergedTagsStyles = useMemo(() => {
    let tags: Record<string, TextStyle> = {
      ...defaultTagsStyles,
      ...customTagsStyles,
      // Bold tags always use Rubik bold, even if callers override partially.
      strong: {
        ...defaultTagsStyles.strong,
        ...customTagsStyles.strong,
        ...boldTextStyle,
      },
      b: {
        ...defaultTagsStyles.b,
        ...customTagsStyles.b,
        ...boldTextStyle,
      },
    };
    if (resolvedColor) {
      tags = withContentColor(tags, resolvedColor);
    }
    return tags;
  }, [customTagsStyles, resolvedColor]);

  const htmlSource = useMemo(() => ({ html }), [html]);

  const baseStyle = useMemo(() => {
    const next = normalizeBaseStyleForHtml(
      (StyleSheet.flatten([defaultTextStyle, style]) ??
        defaultTextStyle) as TextStyle,
      html,
    );
    if (resolvedColor) {
      next.color = resolvedColor;
    }
    return next;
  }, [style, html, resolvedColor]);

  if (!value || typeof value !== "string") {
    return null;
  }

  if (!isHtml) {
    return (
      <Text
        style={[
          defaultTextStyle,
          style,
          resolvedColor ? { color: resolvedColor } : null,
        ]}
      >
        {decoded}
      </Text>
    );
  }

  if (looksLikeMalformedHtml(decoded)) {
    const plain = stripTagLikeContent(decoded);
    return (
      <Text
        style={[
          defaultTextStyle,
          style,
          resolvedColor ? { color: resolvedColor } : null,
        ]}
      >
        {plain}
      </Text>
    );
  }

  return (
    <RenderHtml
      contentWidth={contentWidth}
      source={htmlSource}
      tagsStyles={mergedTagsStyles as any}
      baseStyle={baseStyle as any}
      systemFonts={SYSTEM_FONTS}
    />
  );
}
