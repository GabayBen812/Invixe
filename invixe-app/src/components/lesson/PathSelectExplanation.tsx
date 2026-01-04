import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
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
    const fetchSVG = async () => {
      // ALWAYS prioritize svgPublicUrl if it exists, regardless of svgCode
      const url = svgPublicUrl || svgUrl;
      
      // Log what we have
      console.log('PathSelectExplanation: SVG props:', {
        svgPublicUrl,
        svgUrl,
        svgCode: svgCode ? `exists (${svgCode.length} chars)` : 'none',
        svgCache: svgCache ? `exists (${svgCache.length} chars)` : 'none',
        urlToFetch: url || 'none',
        willFetch: url && !svgCache ? 'YES' : 'NO'
      });
      
      // If we have svgPublicUrl, ALWAYS use it (highest priority)
      // Otherwise, fetch from svgUrl if no cache exists
      if (svgPublicUrl && !svgCache) {
        console.log('PathSelectExplanation: Fetching SVG from svgPublicUrl (priority):', svgPublicUrl);
        try {
          const response = await fetch(svgPublicUrl);
          if (response.ok) {
            const svgText = await response.text();
            console.log('PathSelectExplanation: SVG fetched successfully from svgPublicUrl, length:', svgText.length);
            setSvgCache(svgText);
            parsedCacheRef.current = null; // Clear parsed cache so it will be re-parsed
          } else {
            console.error('PathSelectExplanation: Failed to fetch SVG from svgPublicUrl, status:', response.status);
          }
        } catch (error) {
          console.error('PathSelectExplanation: Failed to fetch SVG from svgPublicUrl:', error);
        }
      } else if (svgUrl && !svgPublicUrl && !svgCache) {
        console.log('PathSelectExplanation: Fetching SVG from svgUrl:', svgUrl);
        try {
          const response = await fetch(svgUrl);
          if (response.ok) {
            const svgText = await response.text();
            console.log('PathSelectExplanation: SVG fetched successfully from svgUrl, length:', svgText.length);
            setSvgCache(svgText);
            parsedCacheRef.current = null; // Clear parsed cache so it will be re-parsed
          } else {
            console.error('PathSelectExplanation: Failed to fetch SVG from svgUrl, status:', response.status);
          }
        } catch (error) {
          console.error('PathSelectExplanation: Failed to fetch SVG from svgUrl:', error);
        }
      } else if (svgCache) {
        console.log('PathSelectExplanation: Using cached SVG');
      } else if (svgCode && svgCode.trim()) {
        console.log('PathSelectExplanation: Using svgCode (no URL available)');
      }
    };
    fetchSVG();
  }, [svgPublicUrl, svgUrl, svgCode, svgCache]);

  // Memoize SVG parsing to avoid re-parsing on every render
  // Priority: svgCache (from URL) > svgCode
  const parsedSVG = useMemo(() => {
    console.log('PathSelectExplanation: useMemo running', {
      hasSvgCache: !!svgCache,
      hasSvgCode: !!svgCode,
      svgCacheLength: svgCache?.length || 0,
      svgCodeLength: svgCode?.length || 0,
      hasParsedCache: !!parsedCacheRef.current
    });
    
    // Prioritize svgCache (from svgPublicUrl/svgUrl) over svgCode
    const svgToParse = svgCache || svgCode;
    if (!svgToParse || !svgToParse.trim()) {
      console.log('PathSelectExplanation: No SVG code to parse');
      return null;
    }
    
    console.log('PathSelectExplanation: Parsing SVG, length:', svgToParse.length, 'source:', svgCache ? 'cache (from URL)' : 'svgCode');
    
    // Check parsed cache first
    if (parsedCacheRef.current) {
      console.log('PathSelectExplanation: Using cached parsed SVG');
      return parsedCacheRef.current;
    }
    
    console.log('PathSelectExplanation: Calling parseSVGCode...');
    const startTime = Date.now();
    const parsed = parseSVGCode(svgToParse);
    const parseTime = Date.now() - startTime;
    
    if (parsed) {
      console.log(`PathSelectExplanation: SVG parsed successfully in ${parseTime}ms`);
      parsedCacheRef.current = parsed;
    } else {
      console.error(`PathSelectExplanation: SVG parsing failed after ${parseTime}ms - parseSVGCode returned null`);
      console.error('PathSelectExplanation: SVG preview (first 500 chars):', svgToParse.substring(0, 500));
    }
    return parsed;
  }, [svgCode, svgCache]);

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
        
        {(parsedSVG || svgCode || svgUrl || svgPublicUrl || svgCache) && (
          <View style={styles.svgContainer}>
            {parsedSVG ? (
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {parsedSVG}
              </View>
            ) : (svgCode || svgCache) ? (
              // We have SVG code but parsing failed or is in progress
              <View style={styles.svgPlaceholder}>
                <ActivityIndicator size="small" color="#3372D8" />
                <Text style={styles.svgPlaceholderText}>
                  {svgCache ? 'Parsing SVG...' : 'Loading SVG...'}
                </Text>
                <Text style={[styles.svgPlaceholderText, { fontSize: 12, marginTop: 4 }]}>
                  {svgCache ? `(${Math.round((svgCache.length / 1024))}KB)` : ''}
                </Text>
              </View>
            ) : (svgUrl || svgPublicUrl) ? (
              // We have URLs but haven't fetched yet
              <View style={styles.svgPlaceholder}>
                <ActivityIndicator size="small" color="#3372D8" />
                <Text style={styles.svgPlaceholderText}>Loading...</Text>
              </View>
            ) : null}
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
    minHeight: 200,
    maxHeight: 300,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
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

