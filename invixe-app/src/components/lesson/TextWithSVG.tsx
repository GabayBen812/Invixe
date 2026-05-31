import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';
import { fetchRemoteText } from '../../utils/remoteAssetCache';
import HtmlText from '../ui/HtmlText';
import { useDrillViewportHeight } from './DrillViewport';
import { computeStackDrillLayout } from '../../utils/drillFitLayout';

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
  const viewportHeight = useDrillViewportHeight();
  const layout = useMemo(
    () =>
      computeStackDrillLayout(viewportHeight > 0 ? viewportHeight : 360, {
        hasImage: true,
        textLines: text ? Math.min(6, Math.ceil(text.length / 35)) : 2,
      }),
    [viewportHeight, text],
  );

  useEffect(() => {
    const fetchSVG = async () => {
      const url = svgPublicUrl || svgUrl;
      if (url && !svgCode && !svgCache) {
        try {
          const svgText = await fetchRemoteText(url);
          setSvgCache(svgText);
          parsedCacheRef.current = null;
        } catch (error) {
          console.error('Failed to fetch SVG:', error);
        }
      }
    };
    fetchSVG();
  }, [svgPublicUrl, svgUrl, svgCode, svgCache]);

  const parsedSVG = useMemo(() => {
    const svgToParse = svgCode || svgCache;
    if (!svgToParse) return null;

    if (parsedCacheRef.current) {
      return parsedCacheRef.current;
    }

    const parsed = parseSVGCode(svgToParse);
    parsedCacheRef.current = parsed;
    return parsed;
  }, [svgCode, svgCache]);

  return (
    <View style={styles.container}>
      <View style={[styles.explainContainer, { gap: layout.gap }]}>
        {!!text && (
          <HtmlText
            value={text}
            style={[
              styles.explainText,
              {
                fontSize: layout.textFontSize,
                lineHeight: layout.textLineHeight,
                marginBottom: layout.gap,
              },
            ]}
          />
        )}
        <View style={[styles.svgContainer, { height: layout.imageHeight }]}>
          {parsedSVG || (
            <View style={styles.svgPlaceholder}>
              <Text style={styles.svgPlaceholderText}>SVG</Text>
            </View>
          )}
        </View>
      </View>
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
    justifyContent: 'center',
  },
  explainContainer: {
    width: '92%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  explainText: {
    color: '#0D2033',
    fontWeight: '700',
    textAlign: 'center',
  },
  svgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  svgPlaceholder: {
    width: '100%',
    height: '100%',
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
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
