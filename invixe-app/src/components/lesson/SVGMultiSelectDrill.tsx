import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { SvgProps } from 'react-native-svg';

export interface SVGMultiSelectOption {
  id: string;
  label?: string;
  svgComponent?: React.ComponentType<SvgProps>;
  svgCode?: string;
  backgroundColor?: string;
  correct: boolean;
}

interface Props {
  title?: string;
  options: SVGMultiSelectOption[];
  layout?: 'grid' | 'list';
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: { 
    selectedIds: string[]; 
    numCorrectSelections: number; 
    perOptionCorrectness: Record<string, boolean>; 
    allCorrect: boolean; 
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function SVGMultiSelectDrill({ title, options, layout = 'grid', submitText = 'בדוק', correctExplanation, wrongExplanation, onSubmit }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedIds = useMemo(() => Object.keys(selected).filter(k => selected[k]), [selected]);

  const perOptionCorrectness = useMemo(() => {
    const res: Record<string, boolean> = {};
    options.forEach(o => {
      const picked = !!selected[o.id];
      // correctness per option: if picked, it is correct only if option.correct
      // if not picked and option.correct, then it's an error
      res[o.id] = (picked && o.correct) || (!picked && !o.correct);
    });
    return res;
  }, [selected, options]);

  const numCorrectSelections = useMemo(() => {
    let count = 0;
    options.forEach(o => {
      const picked = !!selected[o.id];
      if (picked && o.correct) count += 1;
    });
    return count;
  }, [selected, options]);

  const allCorrect = useMemo(() => Object.values(perOptionCorrectness).every(Boolean), [perOptionCorrectness]);

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = allCorrect;
    setIsCorrect(correct);
    setShowingExplanation(true);
  };

  const handleContinue = () => {
    const explanation = isCorrect ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      selectedIds, 
      numCorrectSelections, 
      perOptionCorrectness, 
      allCorrect,
      isCorrect,
      explanation
    });
  };

  const renderSVG = (option: SVGMultiSelectOption) => {
    if (option.svgComponent) {
      const SvgComponent = option.svgComponent;
      return <SvgComponent width={60} height={60} />;
    }
    
    if (option.svgCode) {
      // For now, we'll render a placeholder. In a real implementation,
      // you'd parse and render the SVG code using react-native-svg
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>SVG</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={[styles.optionsContainer, layout === 'grid' ? styles.grid : styles.list]}> 
        {options.map((opt) => {
          const picked = !!selected[opt.id];
          const isCorrectAfterSubmit = submitted ? perOptionCorrectness[opt.id] : undefined;
          const bg = submitted
            ? (picked && opt.correct) || (!picked && !opt.correct) ? '#62D24C' : '#FF6B6B'
            : picked ? '#3F9FFF' : (opt.backgroundColor || '#FFFFFF');
          const textColor = submitted || picked ? '#FFFFFF' : '#0D2033';
          
          return (
            <Pressable key={opt.id} onPress={() => toggle(opt.id)} style={[styles.optionCard, { backgroundColor: bg }]}> 
              <View style={styles.svgContainer}>
                {renderSVG(opt)}
              </View>
              {opt.label ? <Text style={[styles.optionLabel, { color: textColor }]}>{opt.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.submitButton} onPress={showingExplanation ? handleContinue : handleSubmit}>
        <Text style={styles.submitText}>{showingExplanation ? 'המשך' : submitText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D2033',
    marginBottom: 10,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  list: {
    flexDirection: 'column',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: 60,
    height: 60,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPlaceholderText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default SVGMultiSelectDrill;
