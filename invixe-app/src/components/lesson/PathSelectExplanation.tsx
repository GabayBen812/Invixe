import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import { fetchRemoteText } from "../../utils/remoteAssetCache";
import HtmlText from "../ui/HtmlText";

interface Props {
  explanation: string;
  imageUrl?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  isComplexMedia?: boolean;
}

export default function PathSelectExplanation({
  explanation,
  imageUrl,
  svgCode,
  svgUrl,
  svgPublicUrl,
  isComplexMedia = false,
}: Props) {
  const [svgCache, setSvgCache] = useState<string | null>(null);
  const parsedCacheRef = React.useRef<React.ReactElement | null>(null);
  const cacheUrlRef = useRef<string | null>(null); // Track which URL the cache came from
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  // Reset image loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      console.log("PathSelectExplanation: Loading image:", imageUrl);
    }
  }, [imageUrl]);

  // Fetch SVG from URL if available - ALWAYS prioritize svgPublicUrl
  useEffect(() => {
    // Determine which URL to use (priority: svgPublicUrl > svgUrl)
    const urlToUse = svgPublicUrl || svgUrl;

    // If we have no URL, clear cache and return
    if (!urlToUse) {
      if (cacheUrlRef.current) {
        console.log("PathSelectExplanation: No URL provided, clearing cache");
        setSvgCache(null);
        cacheUrlRef.current = null;
        parsedCacheRef.current = null;
      }
      return;
    }

    // If cache URL doesn't match current URL, clear cache
    if (cacheUrlRef.current && cacheUrlRef.current !== urlToUse) {
      console.log(
        "PathSelectExplanation: URL changed, clearing old cache. Old URL:",
        cacheUrlRef.current,
        "New URL:",
        urlToUse,
      );
      setSvgCache(null);
      cacheUrlRef.current = null;
      parsedCacheRef.current = null;
    }

    // If we already have cache for this URL (check ref, not state), don't fetch again
    if (cacheUrlRef.current === urlToUse && svgCache) {
      console.log(
        "PathSelectExplanation: Using existing cache for URL:",
        urlToUse,
      );
      return;
    }

    // Fetch the SVG
    let cancelled = false;
    const fetchSVG = async () => {
      console.log("PathSelectExplanation: Fetching SVG from URL:", urlToUse);
      try {
        const svgText = await fetchRemoteText(urlToUse);
        if (!cancelled) {
          setSvgCache(svgText);
          cacheUrlRef.current = urlToUse;
          parsedCacheRef.current = null;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("PathSelectExplanation: Failed to fetch SVG:", error);
          setSvgCache(null);
          cacheUrlRef.current = null;
        }
      }
    };

    fetchSVG();

    // Cleanup: cancel fetch if URL changes or component unmounts
    return () => {
      cancelled = true;
    };
  }, [svgPublicUrl, svgUrl]); // Only depend on URLs, not cache state

  // Render SVG - use SvgUri for URLs (native, reliable), parse for svgCode
  const renderSVG = () => {
    const currentUrl = svgPublicUrl || svgUrl;

    // If we have a URL, use SvgUri (native component, handles all SVG features)
    if (currentUrl) {
      return (
        <SvgUri
          uri={currentUrl}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }

    // Fallback to parsing svgCode if provided
    if (svgCode && svgCode.trim()) {
      // Check parsed cache first
      if (parsedCacheRef.current) {
        return parsedCacheRef.current;
      }

      // Parse the SVG
      console.log(
        "PathSelectExplanation: Parsing SVG code, length:",
        svgCode.length,
      );
      const startTime = Date.now();
      const parsed = parseSVGCode(svgCode);
      const parseTime = Date.now() - startTime;

      if (parsed) {
        console.log(
          `PathSelectExplanation: SVG parsed successfully in ${parseTime}ms`,
        );
        parsedCacheRef.current = parsed;
        return parsed;
      } else {
        console.error(
          `PathSelectExplanation: SVG parsing failed after ${parseTime}ms`,
        );
        return (
          <View style={styles.svgPlaceholder}>
            <Text style={styles.svgPlaceholderText}>SVG Error</Text>
          </View>
        );
      }
    }

    // No SVG available
    return null;
  };

  const hasMedia = imageUrl || svgCode || svgUrl || svgPublicUrl || svgCache;

  return (
    <View style={styles.container}>
      <View style={styles.explanationContainer}>
        {explanation && (
          <HtmlText value={explanation} style={styles.explanationText} />
        )}

        {imageUrl && (
          <Pressable
            style={styles.imageContainer}
            onPress={() => isComplexMedia && setFullScreenOpen(true)}
            disabled={!isComplexMedia}
          >
            {imageError ? (
              <View
                style={[
                  styles.image,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                  },
                ]}
              >
                <Text
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: 20,
                    fontSize: 14,
                  }}
                >
                  Image not available
                </Text>
              </View>
            ) : (
              <>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                  onError={(error) => {
                    console.error(
                      "Failed to load image in PathSelectExplanation:",
                      imageUrl,
                      error,
                    );
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  onLoad={() => {
                    console.log(
                      "Successfully loaded image in PathSelectExplanation:",
                      imageUrl,
                    );
                    setImageLoading(false);
                  }}
                />
                {imageLoading && (
                  <View
                    style={[
                      styles.image,
                      {
                        position: "absolute",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#f5f5f5",
                      },
                    ]}
                  >
                    <ActivityIndicator size="small" color="#3372D8" />
                  </View>
                )}
                {isComplexMedia && (
                  <View style={styles.fullScreenHint}>
                    <Text style={styles.fullScreenHintText}>🔍 לחץ להגדלה</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>
        )}

        {(svgCode || svgUrl || svgPublicUrl || svgCache) && (
          <Pressable
            style={styles.svgContainer}
            onPress={() => isComplexMedia && setFullScreenOpen(true)}
            disabled={!isComplexMedia}
          >
            {renderSVG()}
            {isComplexMedia && (
              <View style={styles.fullScreenHint}>
                <Text style={styles.fullScreenHintText}>🔍 לחץ להגדלה</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      {/* Full-screen modal */}
      <Modal
        visible={fullScreenOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenOpen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <Pressable
            style={styles.fullScreenBackdrop}
            onPress={() => setFullScreenOpen(false)}
          />
          <View style={styles.fullScreenContent}>
            {/* Close button */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setFullScreenOpen(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            {/* Full-screen image/SVG */}
            {imageUrl && !imageError && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}

            {!imageUrl && (svgCode || svgUrl || svgPublicUrl || svgCache) && (
              <View style={styles.fullScreenSvgContainer}>{renderSVG()}</View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  explanationContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  explanationText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D2033",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 26,
  },
  imageContainer: {
    width: "100%",
    flex: 1,
    minHeight: 300,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  svgContainer: {
    width: "100%",
    flex: 1,
    minHeight: 300,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  svgPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholderText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 16,
  },
  fullScreenHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullScreenHintText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  fullScreenSvgContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
