import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import Svg, { Path, Circle, SvgUri } from "react-native-svg";
import SpeechBubble from "./SpeechBubble";
import HtmlText from "../ui/HtmlText";

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

  // Note: Standard speech bubble is handled by LessonScreen now (removed exclusion)

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Image Area */}
          <View style={styles.imageContainer}>
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

          {/* Explanation Text Box */}
          <View style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <InfoIcon />
            </View>
            <HtmlText
              value={explanationText || "No explanation text provided."}
              style={styles.explanationText}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    marginTop: 20, // Adjust as needed
  },
  imageContainer: {
    width: 250, // Matches 1:1 look roughly
    height: 250,
    marginBottom: 40,
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
    backgroundColor: "#2C6CC4", // Darker blue to match screenshot
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    // In LTR: Icon Left, Text Right.
    // In RTL: Icon Right, Text Left (if row direction flips).
    // Screenshot: Icon Left, Text Right (Hebrew).
    // We want Icon on the visual LEFT.
    // If standard flex row flips in RTL, we need row-reverse to keep Icon on Left?
    // Let's rely on manual ordering: Icon first in DOM usually means Left in LTR.
    // In RTL, First child is Right.
    // So to get Visual Left in RTL, we need LayoutDirection ltr for this specific container? Or just put Text first?
    // If Text is first: Text Right, Icon Left. -> This Matches the screenshot visual (Icon Left).
    // Let's try direction: 'ltr' to force layout if needed, but 'flexDirection: row-reverse' is safer.
    // Assume RTL app: Row -> [Start/Right] [End/Left].
    // We want Icon at Left (End).
    // So <Text /> <Icon /> in RTL Row.
    // My code has <Icon /> <Text />. In RTL this is Icon Right.
    // So I should swap them or use row-reverse.
    // Screenshot: Icon Left. Text Right.
    // Code below uses row-reverse to ensure Icon is Left in RTL context.
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  iconContainer: {
    marginLeft: 0,
    marginRight: 12, // Space between icon and text (since reversed)
    // Actually if reversed, Icon is at left. Text is at right.
    // Margin should be between them.
  },
  explanationText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "right", // Hebrew text alignment
    fontWeight: "600",
    lineHeight: 22,
    marginRight: 12, // Gap from Icon (which is on Left)
  },
});
