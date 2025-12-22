import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

interface Props {
  text?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  submitText?: string;
  onContinue: () => void;
  showButton?: boolean;
}

export default function TextWithSVG({ 
  text,
  svgCode,
  svgUrl,
  svgPublicUrl,
  submitText = 'המשך',
  onContinue,
  showButton = true
}: Props) {
  const [svgCache, setSvgCache] = useState<string | null>(null);
  const parsedCacheRef = useRef<React.ReactElement | null>(null);

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
            parsedCacheRef.current = null; // Clear parsed cache so it will be re‑parsed
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

    // If we've already parsed this exact SVG, reuse it
    if (parsedCacheRef.current) {
      return parsedCacheRef.current;
    }

    const parsed = parseSVGCode(svgToParse);
    parsedCacheRef.current = parsed;
    return parsed;
  }, [svgCode, svgCache]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.explainContainer}>
          {!!text && (
            <Text style={styles.explainText}>{text}</Text>
          )}
          <View style={styles.svgContainer}>
            {parsedSVG || (
              <View style={styles.svgPlaceholder}>
                <Text style={styles.svgPlaceholderText}>SVG</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {showButton && (
        <Pressable
          style={styles.simpleTextButton}
          onPress={onContinue}
        >
          <Text style={styles.confirmButtonText}>
            {submitText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  explainContainer: {
    width: '92%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  explainText: {
    color: '#0D2033',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  svgContainer: {
    width: '100%',
    minHeight: 220,
    maxHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  svgPlaceholder: {
    width: '100%',
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
  simpleTextButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

