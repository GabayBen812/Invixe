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
import { useDrillViewportHeight } from "./DrillViewport";

type Props = {
  isCorrect: boolean;
  imageUrl?: string | null;
  svgCode?: string | null;
  svgUrl?: string | null;
  svgPublicUrl?: string | null;
};

function ResultBadge({ isCorrect }: { isCorrect: boolean }) {
  if (isCorrect) {
    return (
      <View style={styles.correctBadge}>
        <Text style={styles.badgeText}>✓ נכון</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrongRow}>
      <Text style={styles.wrongHint}>לא בדיוק</Text>
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
  const bareHeight = computeBareChartHeight(drillViewportHeight, screenHeight, {
    reservedSpace: 110,
    fraction: 0.75,
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

  if (isBareChart) {
    return (
      <View style={styles.bareRoot}>
        <View style={styles.bareBadge}>
          <ResultBadge isCorrect={isCorrect} />
        </View>
        <View style={[styles.bareMedia, { height: bareHeight }]}>{mediaContent}</View>
      </View>
    );
  }

  return (
    <View style={styles.boxedRoot}>
      <View style={styles.boxedBadge}>
        <ResultBadge isCorrect={isCorrect} />
      </View>
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
  bareBadge: {
    position: "absolute",
    top: 4,
    right: 12,
    zIndex: 10,
  },
  bareMedia: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  boxedRoot: {
    width: "100%",
    flex: 1,
    maxHeight: "75%",
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  boxedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
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
