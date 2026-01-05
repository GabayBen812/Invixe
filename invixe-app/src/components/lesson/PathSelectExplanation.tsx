import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { parseSVGCode } from '../../utils/svgParser';

interface Props {
  explanation: string;
  imageUrl?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
}

export default function PathSelectExplanation({
  explanation,
  imageUrl,
  svgCode,
  svgUrl,
  svgPublicUrl
}: Props) {
  const [svgCache, setSvgCache] = useState<string | null>(null);
  const parsedCacheRef = React.useRef<React.ReactElement | null>(null);
  const cacheUrlRef = React.useRef<string | null>(null); // Track which URL the cache came from
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset image loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      console.log('PathSelectExplanation: Loading image:', imageUrl);
    }
  }, [imageUrl]);

  // Fetch SVG from URL if available - ALWAYS prioritize svgPublicUrl
  useEffect(() => {
    // Determine which URL to use (priority: svgPublicUrl > svgUrl)
    const urlToUse = svgPublicUrl || svgUrl;
    
    // If we have no URL, clear cache and return
    if (!urlToUse) {
      if (cacheUrlRef.current) {
        console.log('PathSelectExplanation: No URL provided, clearing cache');
        setSvgCache(null);
        cacheUrlRef.current = null;
        parsedCacheRef.current = null;
      }
      return;
    }

    // If cache URL doesn't match current URL, clear cache
    if (cacheUrlRef.current && cacheUrlRef.current !== urlToUse) {
      console.log('PathSelectExplanation: URL changed, clearing old cache. Old URL:', cacheUrlRef.current, 'New URL:', urlToUse);
      setSvgCache(null);
      cacheUrlRef.current = null;
      parsedCacheRef.current = null;
    }

    // If we already have cache for this URL (check ref, not state), don't fetch again
    if (cacheUrlRef.current === urlToUse && svgCache) {
      console.log('PathSelectExplanation: Using existing cache for URL:', urlToUse);
      return;
    }

    // Fetch the SVG
    let cancelled = false;
    const fetchSVG = async () => {
      console.log('PathSelectExplanation: Fetching SVG from URL:', urlToUse);
      try {
        const response = await fetch(urlToUse);
        if (!cancelled && response.ok) {
          const svgText = await response.text();
          console.log('PathSelectExplanation: SVG fetched successfully, length:', svgText.length);
          setSvgCache(svgText);
          cacheUrlRef.current = urlToUse; // Track which URL this cache is for
          parsedCacheRef.current = null; // Clear parsed cache so it will be re-parsed
        } else if (!cancelled) {
          console.error('PathSelectExplanation: Failed to fetch SVG, status:', response.status);
          setSvgCache(null);
          cacheUrlRef.current = null;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('PathSelectExplanation: Failed to fetch SVG:', error);
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
      console.log('PathSelectExplanation: Parsing SVG code, length:', svgCode.length);
      const startTime = Date.now();
      const parsed = parseSVGCode(svgCode);
      const parseTime = Date.now() - startTime;
      
      if (parsed) {
        console.log(`PathSelectExplanation: SVG parsed successfully in ${parseTime}ms`);
        parsedCacheRef.current = parsed;
        return parsed;
      } else {
        console.error(`PathSelectExplanation: SVG parsing failed after ${parseTime}ms`);
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

  return (
    <View style={styles.container}>
      <View style={styles.explanationContainer}>
        {explanation && (
          <Text style={styles.explanationText}>{explanation}</Text>
        )}
        
        {imageUrl && (
          <View style={styles.imageContainer}>
            {imageError ? (
              <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
                <Text style={{ color: '#999', textAlign: 'center', padding: 20, fontSize: 14 }}>
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
                    console.error('Failed to load image in PathSelectExplanation:', imageUrl, error);
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded image in PathSelectExplanation:', imageUrl);
                    setImageLoading(false);
                  }}
                />
                {imageLoading && (
                  <View style={[styles.image, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
                    <ActivityIndicator size="small" color="#3372D8" />
                  </View>
                )}
              </>
            )}
          </View>
        )}
        
        {(svgCode || svgUrl || svgPublicUrl || svgCache) && (
          <View style={styles.svgContainer}>
            {renderSVG()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  explanationContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  explanationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D2033',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  imageContainer: {
    width: '100%',
    minHeight: 200,
    maxHeight: 300,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  svgContainer: {
    width: '100%',
    height: 300,          // ❗ חובה
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },  
  svgPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPlaceholderText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 16,
  },
});

