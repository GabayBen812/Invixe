import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Svg, { Path, Circle, SvgUri } from "react-native-svg";
import HtmlText from "../ui/HtmlText";
import { useDrillViewportHeight } from "./DrillViewport";
import { computeStackDrillLayout } from "../../utils/drillFitLayout";

interface ExplanationDrillProps {
  step: any;
}

const InfoIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
    <Path d="M12 16V12" stroke="white" strokeWidth="2" />
    <Path d="M12 8H12.01" stroke="white" strokeWidth="2" />
  </Svg>
);

export default function ExplanationDrill({ step }: ExplanationDrillProps) {
  const config = step.activityConfig?.explanation || {};
  const { imagePublicUrl, imageUrl, imageType, explanationText, buttonText } =
    config;

  const finalImageUrl = imagePublicUrl || imageUrl;
  const isSvg =
    imageType === "svg" ||
    (finalImageUrl && finalImageUrl.toLowerCase().endsWith(".svg"));

  const viewportHeight = useDrillViewportHeight();
  const textLength = (explanationText || "").length;
  const layout = useMemo(
    () =>
      computeStackDrillLayout(viewportHeight > 0 ? viewportHeight : 360, {
        hasImage: !!finalImageUrl,
        textLines: Math.min(8, Math.ceil(textLength / 40) || 3),
      }),
    [viewportHeight, finalImageUrl, textLength],
  );

  return (
    <View style={[styles.container, { paddingHorizontal: 16 }]}>
      <View style={[styles.contentContainer, { gap: layout.gap }]}>
        <View style={[styles.imageContainer, { height: layout.imageHeight }]}>
          {finalImageUrl ? (
            isSvg ? (
              <SvgUri width="100%" height="100%" uri={finalImageUrl} />
            ) : (
              <Image
                source={{ uri: finalImageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            )
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.textContainer,
            {
              padding: layout.textPadding,
              maxHeight:
                viewportHeight > 0
                  ? viewportHeight - layout.imageHeight - layout.gap - 24
                  : undefined,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <InfoIcon />
          </View>
          <HtmlText
            value={explanationText || "No explanation text provided."}
            style={[
              styles.explanationText,
              {
                fontSize: layout.textFontSize,
                lineHeight: layout.textLineHeight,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    maxWidth: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  placeholderText: {
    color: "#999",
  },
  textContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#2C6CC4",
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  iconContainer: {
    marginRight: 12,
  },
  explanationText: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "right",
    fontWeight: "600",
    marginRight: 12,
  },
});
