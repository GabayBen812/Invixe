import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

interface Props {
  explanation: string;
  imageUrl?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  continueText?: string;
  onContinue: () => void;
}

export default function PathSelectExplanation({
  explanation,
  imageUrl,
  svgCode,
  svgUrl,
  svgPublicUrl,
  continueText = 'המשך',
  onContinue
}: Props) {
  const [svgCache, setSvgCache] = useState<string | null>(null);
  const parsedCacheRef = React.useRef<React.ReactElement | null>(null);

  // Fetch SVG from URL if available
  useEffect(() => {
    const fetchSVG = async () => {
      const url = svgPublicUrl || svgUrl;
      if (url && !svgCode && !svgCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const svgText = await response.text();
            setSvgCache(svgText);
            parsedCacheRef.current = null; // Clear parsed cache
          }
        } catch (error) {
          console.error('Failed to fetch SVG:', error);
        }
      }
    };
    fetchSVG();
  }, [svgPublicUrl, svgUrl, svgCode, svgCache]);

  // Memoize SVG parsing to avoid re-parsing on every render
  const parsedSVG = useMemo(() => {
    const svgToParse = svgCode || svgCache;
    if (!svgToParse) return null;
    
    // Check parsed cache first
    if (parsedCacheRef.current) {
      return parsedCacheRef.current;
    }
    
    const parsed = parseSVGCode(svgToParse);
    if (parsed) {
      parsedCacheRef.current = parsed;
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
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
        
        {(parsedSVG || svgCode || svgUrl || svgPublicUrl) && (
          <View style={styles.svgContainer}>
            {parsedSVG || (
              <View style={styles.svgPlaceholder}>
                <Text style={styles.svgPlaceholderText}>SVG</Text>
              </View>
            )}
          </View>
        )}
        
        <Pressable style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>{continueText}</Text>
        </Pressable>
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
  },
  image: {
    width: '100%',
    height: '100%',
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
  continueButton: {
    marginTop: 8,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

