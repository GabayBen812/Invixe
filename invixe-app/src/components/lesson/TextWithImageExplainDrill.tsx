import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import HtmlText from "../ui/HtmlText";
import { useLessonTheme } from "../../context/LessonThemeContext";
import {
  getAlternateSupabaseUrl,
  normalizeSupabaseUrl,
} from "../../utils/supabaseUrl";
import { font } from "../../theme";

type Props = {
  title: string;
  imageUrl?: string | null;
  stepId: string;
  /** Image-only steps: fill the drill area, no white card wrapper. */
  fullscreen?: boolean;
};

export default function TextWithImageExplainDrill({
  title,
  imageUrl,
  stepId,
  fullscreen = false,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const hasTitle = !!title?.trim();
  const cardWidth = Math.min(480, screenWidth - 24);
  const imageHeight = useMemo(
    () => Math.min(460, Math.max(300, Math.round(screenHeight * 0.46))),
    [screenHeight],
  );

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);
  const [activeUri, setActiveUri] = useState(
    () => (imageUrl ? normalizeSupabaseUrl(imageUrl) || imageUrl : ""),
  );
  const triedAlternateRef = useRef(false);

  useEffect(() => {
    if (!imageUrl) {
      setActiveUri("");
      setHasError(false);
      setIsLoading(false);
      return;
    }
    triedAlternateRef.current = false;
    setActiveUri(normalizeSupabaseUrl(imageUrl) || imageUrl);
    setHasError(false);
    setIsLoading(true);
  }, [imageUrl]);

  const handleImageError = () => {
    const alternate = getAlternateSupabaseUrl(activeUri);
    if (alternate && !triedAlternateRef.current) {
      triedAlternateRef.current = true;
      setIsLoading(true);
      setActiveUri(alternate);
      return;
    }
    console.error(
      "Failed to load image for textWithImageExplain step",
      stepId,
    );
    setHasError(true);
    setIsLoading(false);
  };

  const imageContent = imageUrl ? (
    hasError ? (
      <Text
        style={[
          styles.imageError,
          isPractice && { color: theme.choiceDisabledText },
        ]}
      >
        התמונה לא זמינה
      </Text>
    ) : (
      <>
        <Image
          source={{ uri: activeUri }}
          style={fullscreen ? styles.fullscreenImage : styles.image}
          resizeMode="contain"
          onError={handleImageError}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <View
            style={[
              styles.imageLoading,
              isPractice && styles.imageLoadingPractice,
            ]}
          >
            <ActivityIndicator
              size="small"
              color={isPractice ? theme.progressFill : "#3372D8"}
            />
          </View>
        )}
      </>
    )
  ) : (
    <Text
      style={[
        styles.imageError,
        isPractice && { color: theme.choiceDisabledText },
      ]}
    >
      התמונה לא זמינה
    </Text>
  );

  // Image-only: no card chrome — let the asset fill the drill area.
  if (fullscreen || !hasTitle) {
    return (
      <View style={styles.fullscreenRoot}>
        <View style={styles.fullscreenImageWrap}>{imageContent}</View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { width: cardWidth, maxWidth: cardWidth },
          isPractice && {
            backgroundColor: theme.contentPanelBg,
            borderWidth: 1,
            borderColor: theme.mediaSurfaceBorder,
            shadowOpacity: 0,
            elevation: 0,
          },
        ]}
      >
        <View
          style={[
            styles.titleSection,
            isPractice && { borderBottomColor: theme.mediaSurfaceBorder },
          ]}
        >
          <HtmlText
            value={title}
            style={styles.title}
            contentColor={isPractice ? theme.instructionText : "#0D2033"}
          />
        </View>

        <View
          style={[
            styles.imagePanel,
            { height: imageHeight },
            isPractice && {
              backgroundColor: theme.mediaSurfaceBg,
              borderWidth: 1,
              borderColor: theme.mediaSurfaceBorder,
            },
          ]}
        >
          {imageContent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenRoot: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  fullscreenImageWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  root: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingBottom: 96,
  },
  card: {
    flexGrow: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 24,
    alignSelf: "center",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  titleSection: {
    width: "100%",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EEF7",
    marginBottom: 20,
  },
  title: {
    color: "#0D2033",
    // Weight comes from HtmlText / <strong> — do not force 800 here or bold
    // markup inverts on Android (body bold, <strong> regular).
    fontFamily: font.family,
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    width: "100%",
  },
  imagePanel: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#F4F7FC",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 247, 252, 0.85)",
  },
  imageLoadingPractice: {
    backgroundColor: "rgba(15, 20, 36, 0.55)",
  },
  imageError: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    padding: 24,
  },
});
