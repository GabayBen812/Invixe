import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { SvgProps } from 'react-native-svg';
import { parseSVGCode } from '../../utils/svgParser';

export interface SVGMultiSelectOption {
  id: string;
  label?: string;
  svgComponent?: React.ComponentType<SvgProps>;
  svgCode?: string; // Legacy: inline SVG code (for backward compatibility)
  svgUrl?: string; // Blob URL or public URL for preview
  svgPublicUrl?: string; // Supabase storage public URL
  svgPath?: string; // Storage path
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
  showSubmitButton?: boolean;
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onSubmit: (result: { 
    selectedIds: string[]; 
    numCorrectSelections: number; 
    perOptionCorrectness: Record<string, boolean>; 
    allCorrect: boolean; 
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

function SVGMultiSelectDrill({ title, options, layout = 'grid', submitText = 'בדוק', correctExplanation, wrongExplanation, showSubmitButton = true, onStateChange, onSubmitTriggerRef, onSubmit }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Expose state to parent for button management
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({ 
        showingExplanation, 
        canSubmit: Object.keys(selected).filter(k => selected[k]).length > 0 
      });
    }
  }, [showingExplanation, selected, onStateChange]);

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
    setSelected(prev => {
      const newSelected = { ...prev, [id]: !prev[id] };
      // Auto-submit when an option is selected and showSubmitButton is false
      if (!showSubmitButton && Object.keys(newSelected).filter(k => newSelected[k]).length > 0) {
        // Don't auto-submit, let user see their selection
        // Submit will be triggered by parent button
      }
      return newSelected;
    });
  };

  const handleSubmit = React.useCallback(() => {
    if (Object.keys(selected).filter(k => selected[k]).length === 0) return; // Can't submit without selection
    setSubmitted(true);
    const correct = allCorrect;
    setIsCorrect(correct);
    setShowingExplanation(true);
    
    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      selectedIds, 
      numCorrectSelections, 
      perOptionCorrectness, 
      allCorrect,
      isCorrect: correct,
      explanation
    });
  }, [allCorrect, correctExplanation, wrongExplanation, selectedIds, numCorrectSelections, perOptionCorrectness, onSubmit, selected]);

  const handleContinue = React.useCallback(() => {
    const explanation = isCorrect ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      selectedIds, 
      numCorrectSelections, 
      perOptionCorrectness, 
      allCorrect,
      isCorrect,
      explanation
    });
  }, [isCorrect, correctExplanation, wrongExplanation, selectedIds, numCorrectSelections, perOptionCorrectness, allCorrect, onSubmit]);

  // Expose submit function to parent via ref (must be after handleSubmit is defined)
  React.useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, handleSubmit]);


  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Fetch SVG from URL if available
  useEffect(() => {
    const fetchSVGs = async () => {
      for (const option of options) {
        const url = option.svgPublicUrl || option.svgUrl;
        if (url && !svgCache[option.id] && !option.svgCode && !fetchingRef.current.has(url)) {
          fetchingRef.current.add(url);
          try {
            const response = await fetch(url);
            if (response.ok) {
              const svgText = await response.text();
              setSvgCache(prev => {
                // Only update if not already cached (prevent race conditions)
                if (!prev[option.id]) {
                  return { ...prev, [option.id]: svgText };
                }
                return prev;
              });
            }
          } catch (error) {
            console.error(`Failed to fetch SVG for option ${option.id}:`, error);
          } finally {
            fetchingRef.current.delete(url);
          }
        }
      }
    };
    fetchSVGs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.map(o => o.svgPublicUrl || o.svgUrl || o.id).join(',')]); // Fetch when URLs change

  const renderSVG = (option: SVGMultiSelectOption) => {
    if (option.svgComponent) {
      const SvgComponent = option.svgComponent;
      return <SvgComponent width={60} height={60} />;
    }
    
    // Priority: 1) svgPublicUrl (fetch from cache), 2) svgCode (legacy), 3) svgUrl (fetch)
    let svgCodeToParse: string | undefined;
    
    if (option.svgPublicUrl && svgCache[option.id]) {
      svgCodeToParse = svgCache[option.id];
    } else if (option.svgCode) {
      svgCodeToParse = option.svgCode;
    } else if (option.svgUrl && svgCache[option.id]) {
      svgCodeToParse = svgCache[option.id];
    }
    
    if (svgCodeToParse) {
      // Parse and render the SVG code using react-native-svg
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        return (
          <View style={styles.svgContainer}>
            {parsedSVG}
          </View>
        );
      }
      // Fallback to placeholder if parsing fails
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>SVG</Text>
        </View>
      );
    }
    
    // If we have a URL but haven't fetched it yet, show loading
    if (option.svgPublicUrl || option.svgUrl) {
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>...</Text>
        </View>
      );
    }
    
    return null;
  };

  // If showSubmitButton is false, we need a way to trigger submit from parent
  // For now, submit happens automatically when user selects options (for better UX)
  // Actually, we need to expose a submit trigger - but let's keep it simple:
  // The parent will show the button only when showingExplanation is true
  
  // Debug: log if options are empty
  if (!options || options.length === 0) {
    console.warn('SVGMultiSelectDrill: No options provided');
  }

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {options && options.length > 0 ? (
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
              {renderSVG(opt)}
              {opt.label ? <Text style={[styles.optionLabel, { color: textColor }]}>{opt.label}</Text> : null}
            </Pressable>
          );
        })}
        </View>
      ) : (
        <Text style={{ padding: 20, color: '#666' }}>No options available</Text>
      )}
      {showSubmitButton && (
        <Pressable 
          style={[styles.submitButton, Object.keys(selected).filter(k => selected[k]).length === 0 && !showingExplanation && styles.submitButtonDisabled]} 
          onPress={showingExplanation ? handleContinue : handleSubmit}
          disabled={!showingExplanation && Object.keys(selected).filter(k => selected[k]).length === 0}
        >
          <Text style={styles.submitText}>{showingExplanation ? 'המשך' : submitText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
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
    paddingHorizontal: 0,
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
    minHeight: 100,
  },
  svgContainer: {
    width: 60,
    height: 60,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default SVGMultiSelectDrill;
