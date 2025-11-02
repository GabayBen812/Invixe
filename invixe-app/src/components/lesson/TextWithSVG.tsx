import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

interface Props {
  text?: string;
  svgCode?: string;
  submitText?: string;
  onContinue: () => void;
}

export default function TextWithSVG({ 
  text,
  svgCode,
  submitText = 'המשך',
  onContinue 
}: Props) {
  const parsedSVG = svgCode ? parseSVGCode(svgCode) : null;

  return (
    <View style={styles.container}>
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
        <Pressable
          style={styles.simpleTextButton}
          onPress={onContinue}
        >
          <Text style={styles.confirmButtonText}>
            {submitText}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
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
    marginTop: 20,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center'
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

