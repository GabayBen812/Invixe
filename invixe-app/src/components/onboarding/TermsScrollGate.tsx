import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import theme, { font } from "../../theme";
import {
  REGISTRATION_LEGAL_HTML,
  REGISTRATION_LEGAL_UPDATED,
} from "../../content/registrationLegal";

const SCROLL_THRESHOLD = 28;
const BOX_HEIGHT = 280;

type Props = {
  onAcceptedChange: (accepted: boolean) => void;
};

const SYSTEM_FONTS = [...defaultSystemFonts, font.family, font.bold];

export default function TermsScrollGate({ onAcceptedChange }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  const contentWidth = Math.max(240, screenWidth - 40 - 36);

  const tagsStyles = useMemo(
    () => ({
      body: {
        color: theme.colors.neutral[800],
        fontSize: 14,
        lineHeight: 22,
        textAlign: "right" as const,
        fontFamily: font.family,
      },
      h1: {
        color: theme.colors.neutral[900],
        fontSize: 18,
        lineHeight: 26,
        textAlign: "right" as const,
        fontFamily: font.bold,
        marginTop: 4,
        marginBottom: 8,
      },
      h2: {
        color: theme.colors.neutral[900],
        fontSize: 15,
        lineHeight: 22,
        textAlign: "right" as const,
        fontFamily: font.bold,
        marginTop: 12,
        marginBottom: 6,
      },
      p: {
        color: theme.colors.neutral[700],
        fontSize: 14,
        lineHeight: 22,
        textAlign: "right" as const,
        fontFamily: font.family,
        marginVertical: 4,
      },
      ul: {
        paddingRight: 16,
        marginVertical: 4,
      },
      li: {
        color: theme.colors.neutral[700],
        fontSize: 14,
        lineHeight: 21,
        textAlign: "right" as const,
        fontFamily: font.family,
        marginVertical: 2,
      },
      strong: {
        fontFamily: font.bold,
        color: theme.colors.neutral[900],
      },
      hr: {
        marginVertical: 16,
      },
    }),
    [],
  );

  const evaluateScrollPosition = useCallback(() => {
    const viewport = viewportHeightRef.current;
    const content = contentHeightRef.current;
    const offset = scrollOffsetRef.current;

    if (viewport <= 0 || content <= 0) return;

    if (content <= viewport + SCROLL_THRESHOLD) {
      setScrolledToEnd(true);
      return;
    }

    setScrolledToEnd(offset + viewport >= content - SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    onAcceptedChange(scrolledToEnd);
  }, [onAcceptedChange, scrolledToEnd]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    evaluateScrollPosition();
  };

  const handleContentSizeChange = (_w: number, h: number) => {
    contentHeightRef.current = h;
    evaluateScrollPosition();
  };

  const handleLayout = (height: number) => {
    viewportHeightRef.current = height;
    evaluateScrollPosition();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>תנאי שימוש ומדיניות פרטיות</Text>
      <Text style={styles.meta}>עודכן לאחרונה: {REGISTRATION_LEGAL_UPDATED}</Text>

      <View
        style={styles.scrollFrame}
        onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          <RenderHtml
            contentWidth={contentWidth}
            source={{ html: REGISTRATION_LEGAL_HTML }}
            tagsStyles={tagsStyles}
            systemFonts={SYSTEM_FONTS}
            baseStyle={tagsStyles.body}
          />
        </ScrollView>

        {!scrolledToEnd ? <View pointerEvents="none" style={styles.fadeHint} /> : null}
      </View>

      <Text style={[styles.hint, scrolledToEnd && styles.hintDone]}>
        {scrolledToEnd
          ? "קראת/י את התנאים — אפשר להמשיך"
          : "גלול/י עד הסוף כדי לאשר ולהמשיך"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: theme.font.bold,
    fontSize: 16,
    color: theme.colors.neutral[900],
    textAlign: "right",
  },
  meta: {
    fontFamily: theme.font.family,
    fontSize: 12,
    color: theme.colors.neutral[500],
    textAlign: "right",
    marginBottom: 4,
  },
  scrollFrame: {
    height: BOX_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E9F4",
    backgroundColor: "#F8FAFD",
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fadeHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: "rgba(248, 250, 253, 0.92)",
  },
  hint: {
    fontFamily: theme.font.family,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.neutral[500],
    textAlign: "center",
    marginTop: 2,
  },
  hintDone: {
    color: theme.colors.success[600],
    fontFamily: theme.font.bold,
  },
});
