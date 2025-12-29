import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
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
  pngUrl?: string; // PNG blob URL or public URL
  pngPublicUrl?: string; // PNG Supabase storage public URL
  pngPath?: string; // PNG storage path
  inputType?: 'svg' | 'png'; // Type of input used
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

  // Reset state when options change (new step)
  React.useEffect(() => {
    setSelected({});
    setSubmitted(false);
    setShowingExplanation(false);
    setIsCorrect(false);
  }, [options.map(o => o.id).join(',')]);

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

  // Get all correct option IDs
  const correctOptionIds = useMemo(() => {
    return options.filter(o => o.correct).map(o => o.id);
  }, [options]);

  // Check if selection is exactly correct: must select exactly all correct answers, no more, no less
  const allCorrect = useMemo(() => {
    // Get current selected IDs
    const currentSelectedIds = Object.keys(selected).filter(k => selected[k]);
    
    // Get all correct option IDs
    const currentCorrectIds = options.filter(o => o.correct).map(o => o.id);
    
    // Must have at least one selection
    if (currentSelectedIds.length === 0) return false;
    
    // Must have at least one correct answer
    if (currentCorrectIds.length === 0) return false;
    
    // Must select exactly the same number as correct answers
    if (currentSelectedIds.length !== currentCorrectIds.length) {
      return false;
    }
    
    // All selected IDs must be in the correct set
    const allSelectedAreCorrect = currentSelectedIds.every(id => currentCorrectIds.includes(id));
    
    // All correct IDs must be in the selected set
    const allCorrectAreSelected = currentCorrectIds.every(id => currentSelectedIds.includes(id));
    
    // Both conditions must be true (they should be equivalent if lengths match, but checking both for safety)
    return allSelectedAreCorrect && allCorrectAreSelected;
  }, [selected, options]);

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
    
    // Recalculate allCorrect directly from current state to ensure accuracy
    const currentSelectedIds = Object.keys(selected).filter(k => selected[k]);
    const currentCorrectIds = options.filter(o => o.correct).map(o => o.id);
    
    let correct = false;
    if (currentSelectedIds.length > 0 && currentCorrectIds.length > 0) {
      if (currentSelectedIds.length === currentCorrectIds.length) {
        const allSelectedAreCorrect = currentSelectedIds.every(id => currentCorrectIds.includes(id));
        const allCorrectAreSelected = currentCorrectIds.every(id => currentSelectedIds.includes(id));
        correct = allSelectedAreCorrect && allCorrectAreSelected;
      }
    }
    
    setIsCorrect(correct);
    setShowingExplanation(true);
    
    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      selectedIds: currentSelectedIds, 
      numCorrectSelections, 
      perOptionCorrectness, 
      allCorrect: correct,
      isCorrect: correct,
      explanation
    });
  }, [selected, options, correctExplanation, wrongExplanation, numCorrectSelections, perOptionCorrectness, onSubmit]);

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
  const parsedCacheRef = useRef<Record<string, React.ReactElement | null>>({});

  // Fetch SVG from URL if available - fetch all in parallel for speed
  useEffect(() => {
    const fetchSVGs = async () => {
      // Collect all URLs to fetch
      const fetchPromises = options.map(async (option) => {
        const url = option.svgPublicUrl || option.svgUrl;
        if (url && !svgCache[option.id] && !option.svgCode && !fetchingRef.current.has(url)) {
          fetchingRef.current.add(url);
          try {
            const response = await fetch(url);
            if (response.ok) {
              const svgText = await response.text();
              return { id: option.id, svgText };
            }
          } catch (error) {
            console.error(`Failed to fetch SVG for option ${option.id}:`, error);
          } finally {
            fetchingRef.current.delete(url);
          }
        }
        return null;
      });

      // Fetch all SVGs in parallel
      const results = await Promise.all(fetchPromises);
      
      // Update cache with all results at once
      setSvgCache(prev => {
        const newCache = { ...prev };
        results.forEach(result => {
          if (result && !newCache[result.id]) {
            newCache[result.id] = result.svgText;
            // Clear parsed cache for this SVG so it gets re-parsed
            delete parsedCacheRef.current[result.id];
          }
        });
        return newCache;
      });
    };
    fetchSVGs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.map(o => o.svgPublicUrl || o.svgUrl || o.id).join(',')]); // Fetch when URLs change

  const renderSVG = (option: SVGMultiSelectOption) => {
    // Handle PNG images
    if (option.inputType === 'png' || option.pngPublicUrl || option.pngUrl) {
      const pngUrl = option.pngPublicUrl || option.pngUrl;
      if (pngUrl) {
        return (
          <View style={styles.svgContainer}>
            <Image
              source={{ uri: pngUrl }}
              style={styles.pngImage}
              resizeMode="contain"
            />
          </View>
        );
      }
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>...</Text>
        </View>
      );
    }

    // Handle SVG
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
      // Check parsed cache first to avoid re-parsing
      const cacheKey = `${option.id}-${svgCodeToParse.substring(0, 50)}`; // Use first 50 chars as hash
      if (parsedCacheRef.current[cacheKey]) {
        return (
          <View style={styles.svgContainer}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              {parsedCacheRef.current[cacheKey]}
            </View>
          </View>
        );
      }
      
      // Parse and render the SVG code using react-native-svg
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        // Cache the parsed result
        parsedCacheRef.current[cacheKey] = parsedSVG;
        return (
          <View style={styles.svgContainer}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              {parsedSVG}
            </View>
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
        <View style={styles.panel}>
          <View style={[styles.optionsContainer, layout === 'grid' ? styles.grid : styles.list]}> 
        {options.map((opt) => {
          const picked = !!selected[opt.id];
          const isCorrectAfterSubmit = submitted ? perOptionCorrectness[opt.id] : undefined;
          // Explicitly convert to boolean - handle undefined, null, string "true"/"false", etc.
          // Check if this option is marked as correct in the options array
          const isCorrectAnswer = opt.correct === true || opt.correct === 'true' || opt.correct === 1; // Whether this option is a correct answer

          // Base (neutral) state – white card like in Figma
          let backgroundColor = opt.backgroundColor || '#FFFFFF';
          let borderColor = 'transparent';
          let borderWidth = 0;
          let textColor = '#0D2033';
          let shadowStyle: any = {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          };

          if (!submitted) {
            if (picked) {
              // Selected before submit – blue highlight
              backgroundColor = '#E0EDFF';
              borderColor = '#3372D8';
              borderWidth = 1;
              shadowStyle = {
                shadowColor: '#101828',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              };
            }
          } else {
            // After submit – show actual correct/wrong answers
            borderWidth = 1;
            shadowStyle = {
              shadowColor: '#101828',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            };
            // Green if this is a correct answer (regardless of whether it was selected)
            // Red if this is a wrong answer (regardless of whether it was selected)
            if (isCorrectAnswer) {
              backgroundColor = '#D1FADF'; // soft green
              borderColor = '#12B76A';
            } else {
              backgroundColor = '#FEE4E2'; // soft red
              borderColor = '#D92D20';
            }
            textColor = '#0D2033';
          }
          
          return (
            <Pressable
              key={opt.id}
              onPress={() => toggle(opt.id)}
              style={[
                styles.optionCard,
                { 
                  backgroundColor, 
                  borderColor, 
                  borderWidth,
                },
                shadowStyle,
              ]}
            > 
              <View
                style={[
                  styles.optionDot,
                  !submitted && picked && styles.optionDotSelected,
                  submitted && isCorrectAnswer && styles.optionDotCorrect,
                  submitted && !isCorrectAnswer && styles.optionDotWrong,
                ]}
              />
              {renderSVG(opt)}
              {opt.label ? <Text style={[styles.optionLabel, { color: textColor }]}>{opt.label}</Text> : null}
            </Pressable>
          );
        })}
          </View>
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
  panel: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 10,
    position: 'relative',
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
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    // Shadow and border properties are set dynamically based on selection state
  },
  optionDot: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E4E7EC',
  },
  optionDotSelected: {
    backgroundColor: '#3372D8',
  },
  optionDotCorrect: {
    backgroundColor: '#12B76A',
  },
  optionDotWrong: {
    backgroundColor: '#D92D20',
  },
  svgContainer: {
    width: 96,
    height: 96,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
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
  pngImage: {
    width: 110,
    height: 110,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
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
