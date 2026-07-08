import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import { fetchRemoteText } from "../../utils/remoteAssetCache";
import {
  computeBareChartHeight,
  isBareChartAsset,
} from "../../utils/graphQuestionMedia";
import { normalizeSupabaseUrl } from "../../utils/supabaseUrl";
import { useLessonTheme } from "../../context/LessonThemeContext";
import { useDrillViewportHeight } from "./DrillViewport";
import PracticeMediaSurface from "./PracticeMediaSurface";

/** Leave room for absolute המשך without eating the chart. */
const CONTINUE_BUTTON_CLEARANCE = 118;

type Props = {
  isCorrect: boolean;
  imageUrl?: string | null;
  svgCode?: string | null;
  svgUrl?: string | null;
  svgPublicUrl?: string | null;
};

function ResultBadge({
  isCorrect,
  wrongHintColor,
}: {
  isCorrect: boolean;
  wrongHintColor: string;
}) {
  if (isCorrect) {
    return (
      <View style={styles.correctBadge}>
        <Text style={styles.badgeText}>✓ נכון</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrongRow}>
      <Text style={[styles.wrongHint, { color: wrongHintColor }]}>לא בדיוק</Text>
      <View style={styles.wrongBadge}>
        <Text style={styles.badgeText}>✗ שגוי</Text>
      </View>
    </View>
  );
}

export default function GraphQuestionExplanationMedia({
  isCorrect,
  imageUrl,
  svgCode,
  svgUrl,
  svgPublicUrl,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const drillViewportHeight = useDrillViewportHeight();
  const { height: screenHeight } = useWindowDimensions();
  const [pngDimensions, setPngDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [svgCache, setSvgCache] = useState<string | null>(null);

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl) return null;
    return normalizeSupabaseUrl(imageUrl) || imageUrl;
  }, [imageUrl]);

  const resolvedSvgUrl = svgPublicUrl || svgUrl || null;

  const hasPng = !!resolvedImageUrl;
  const hasSvg = !!(svgCode || resolvedSvgUrl);
  const mediaType: "svg" | "png" | null = hasPng
    ? "png"
    : hasSvg
      ? "svg"
      : null;

  useEffect(() => {
    if (!resolvedImageUrl) {
      setPngDimensions(null);
      return;
    }
    Image.getSize(
      resolvedImageUrl,
      (width, height) => setPngDimensions({ width, height }),
      () => setPngDimensions(null),
    );
  }, [resolvedImageUrl]);

  useEffect(() => {
    if (svgCode || !resolvedSvgUrl) {
      setSvgCache(null);
      return;
    }
    let cancelled = false;
    fetchRemoteText(resolvedSvgUrl)
      .then((text) => {
        if (!cancelled) setSvgCache(text);
      })
      .catch(() => {
        if (!cancelled) setSvgCache(null);
      });
    return () => {
      cancelled = true;
    };
  }, [svgCode, resolvedSvgUrl]);

  const parsedSvg = useMemo(() => {
    if (mediaType !== "svg") return null;
    const code = svgCode || svgCache;
    return code ? parseSVGCode(code) : null;
  }, [mediaType, svgCode, svgCache]);

  if (!mediaType) return null;

  const isBareChart = isBareChartAsset(mediaType, pngDimensions);

  // Fill most of the space above המשך so the full chart is visible (not cropped).
  const viewport =
    drillViewportHeight > 0
      ? drillViewportHeight
      : Math.min(screenHeight * 0.48, 420);
  const available = Math.max(220, viewport - CONTINUE_BUTTON_CLEARANCE);
  const bareHeight = isPractice
    ? Math.round(Math.min(available * 0.94, available))
    : computeBareChartHeight(drillViewportHeight, screenHeight, {
        reservedSpace: 100,
        fraction: 0.72,
      });

  const mediaContent =
    mediaType === "png" && resolvedImageUrl ? (
      <Image
        source={{ uri: resolvedImageUrl }}
        style={styles.mediaFill}
        resizeMode="contain"
      />
    ) : parsedSvg ? (
      <View style={styles.svgWrap}>{parsedSvg}</View>
    ) : resolvedSvgUrl ? (
      <SvgUri
        uri={resolvedSvgUrl}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      />
    ) : null;

  if (!mediaContent) return null;

  const badge = (
    <ResultBadge
      isCorrect={isCorrect}
      wrongHintColor={isPractice ? theme.instructionText : "#0D2033"}
    />
  );

  if (isBareChart) {
    return (
      <View
        style={[
          styles.bareRoot,
          isPractice && styles.bareRootPractice,
        ]}
      >
        <View style={styles.bareBadge}>{badge}</View>
        <PracticeMediaSurface
          flush
          style={[styles.bareMediaShell, { height: bareHeight }]}
        >
          <View style={styles.bareMediaInner}>{mediaContent}</View>
        </PracticeMediaSurface>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.boxedRoot,
        {
          backgroundColor: isPractice ? theme.contentPanelBg : "#f5f5f5",
          borderColor: isPractice ? theme.mediaSurfaceBorder : "transparent",
          borderWidth: isPractice ? 1 : 0,
          height: isPractice ? bareHeight : undefined,
        },
        isPractice && styles.boxedRootPractice,
      ]}
    >
      <View style={styles.boxedBadge}>{badge}</View>
      <View style={styles.boxedMedia}>{mediaContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bareRoot: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  bareRootPractice: {
    // Center in the band above המשך — don't starve the chart height.
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: CONTINUE_BUTTON_CLEARANCE,
  },
  bareBadge: {
    position: "absolute",
    top: 8,
    right: 16,
    zIndex: 10,
  },
  bareMediaShell: {
    width: "92%",
    maxWidth: 520,
    alignSelf: "center",
  },
  bareMediaInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  boxedRoot: {
    width: "92%",
    maxWidth: 520,
    alignSelf: "center",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  boxedRootPractice: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: CONTINUE_BUTTON_CLEARANCE,
  },
  boxedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  boxedMedia: {
    width: "100%",
    height: "100%",
    minHeight: 200,
  },
  mediaFill: {
    width: "100%",
    height: "100%",
  },
  svgWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  correctBadge: {
    backgroundColor: "#12B76A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wrongRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wrongHint: {
    color: "#0D2033",
    fontWeight: "700",
    fontSize: 18,
  },
  wrongBadge: {
    backgroundColor: "#D92D20",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
