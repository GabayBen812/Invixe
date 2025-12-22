import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, PanResponder, Animated, Easing } from 'react-native';
import { DragonflyDoji, InvertedHammerNew, Doji, ShootingStar, RegularDoji, Hammer } from '../../assets/Candels';
import { parseSVGCode } from '../../utils/svgParser';

interface SlotSpec {
  id: string;
  drawKey?: 'hammer' | 'invertedHammerNew' | 'doji' | 'dragonflyDoji' | 'regularDoji' | 'shootingStar';
  imageSource?: any;
  labelBelow?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  svgPath?: string;
}

interface TokenSpec {
  id: string;
  label: string;
  targetSlotId: string;
}

interface Props {
  slots: SlotSpec[];
  tokens: TokenSpec[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: { 
    numCorrect: number; 
    total: number; 
    mapping: Record<string, string | undefined>; 
    isCorrect: boolean;
    explanation: string;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
}

type Position = { x: number; y: number };

export default function DragMatchDrill({ slots, tokens, submitText = 'אישור', correctExplanation, wrongExplanation, onSubmit, onSubmitTriggerRef, onStateChange }: Props) {
  const [tokenPositions, setTokenPositions] = useState<Record<string, Position>>({});
  const [tokenToSlot, setTokenToSlot] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});

  // Drag state management
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const draggingTokenIdRef = useRef<string | null>(null);
  const bankLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const tokensRowRef = useRef<View | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    draggingTokenIdRef.current = draggingTokenId;
  }, [draggingTokenId]);

  const slotRefs = useRef<Record<string, View | null>>({});
  const slotLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});
  const tokenInitialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const tokenRefs = useRef<Record<string, View | null>>({});
  const tokenLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});
  const tokenOriginalBankLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const tokenAnimated = useRef<Record<string, Animated.ValueXY>>({}).current;
  
  // Magnetic snap threshold (distance in pixels)
  const MAGNETIC_THRESHOLD = 100;

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = slots.map(async (slot) => {
        if (slot.svgPublicUrl && !svgCache[slot.id]) {
          try {
            const response = await fetch(slot.svgPublicUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [slot.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${slot.id}:`, e);
          }
        } else if (slot.svgUrl && !svgCache[slot.id]) {
          try {
            const response = await fetch(slot.svgUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [slot.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${slot.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [slots.map(s => s.svgPublicUrl || s.svgUrl || s.id).join(',')]);

  const getCandleForKey = (key?: SlotSpec['drawKey']) => {
    if (!key) return null;
    switch (key) {
      case 'hammer':
        return <Hammer width={34} height={120} />
      case 'invertedHammerNew':
        return <InvertedHammerNew width={34} height={120} />
      case 'doji':
        return <Doji width={40} height={110} />
      case 'dragonflyDoji':
        return <DragonflyDoji width={40} height={110} />
      case 'regularDoji':
        return <RegularDoji width={40} height={110} />
      case 'shootingStar':
        return <ShootingStar width={34} height={120} />
      default:
        return null;
    }
  };

  const renderSlotContent = (slot: SlotSpec) => {
    // Priority: 1) svgPublicUrl (from cache), 2) svgCode, 3) svgUrl (from cache), 4) drawKey, 5) imageSource
    let svgCodeToParse: string | undefined;
    
    if (slot.svgPublicUrl && svgCache[slot.id]) {
      svgCodeToParse = svgCache[slot.id];
    } else if (slot.svgCode) {
      svgCodeToParse = slot.svgCode;
    } else if (slot.svgUrl && svgCache[slot.id]) {
      svgCodeToParse = svgCache[slot.id];
    }
    
    if (svgCodeToParse) {
      const cacheKey = `${slot.id}-${svgCodeToParse.substring(0, 50)}`;
      if (parsedCacheRef.current[cacheKey]) {
        return (
          <View style={{ width: 34, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            {parsedCacheRef.current[cacheKey]}
          </View>
        );
      }
      
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        parsedCacheRef.current[cacheKey] = parsedSVG;
        return (
          <View style={{ width: 34, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            {parsedSVG}
          </View>
        );
      }
    }
    
    // Fallback to drawKey or imageSource
    if (slot.drawKey) {
      return getCandleForKey(slot.drawKey);
    }
    
    if (slot.imageSource) {
      // If imageSource is provided, render it (would need Image component)
      return null; // For now, return null as imageSource handling would need Image component
    }
    
    return null;
  };

  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Get center point of a layout
  const getCenter = (layout: { x: number; y: number; width: number; height: number }) => {
    return {
      x: layout.x + layout.width / 2,
      y: layout.y + layout.height / 2,
    };
  };

  // Detect which zone a point is in: 'slot', 'bank', or 'middle'
  const detectDropZone = (screenX: number, screenY: number): { zone: 'slot' | 'bank' | 'middle'; slotId?: string; slotCenter?: { x: number; y: number } } => {
    // Check if over any slot
    for (const [slotId, layout] of Object.entries(slotLayouts.current)) {
      if (!layout || !layout.width) continue;
      const within = screenX >= layout.x && screenX <= layout.x + layout.width && 
                    screenY >= layout.y && screenY <= layout.y + layout.height;
      if (within) {
        return { zone: 'slot', slotId, slotCenter: getCenter(layout) };
      }
    }

    // Check if over bank area
    if (bankLayout.current) {
      const bank = bankLayout.current;
      const within = screenX >= bank.x && screenX <= bank.x + bank.width && 
                    screenY >= bank.y && screenY <= bank.y + bank.height;
      if (within) {
        return { zone: 'bank' };
      }
    }

    // Otherwise it's in the middle
    return { zone: 'middle' };
  };

  // Handle slot replacement: return old token to bank, then place new token
  const handleSlotReplacement = (slotId: string, newTokenId: string) => {
    // Find token currently in this slot
    const oldTokenId = Object.keys(tokenToSlot).find(tid => tokenToSlot[tid] === slotId);
    
    if (oldTokenId && oldTokenId !== newTokenId && tokenAnimated[oldTokenId]) {
      // Return old token to bank (position 0,0 relative to its initial position)
      Animated.spring(tokenAnimated[oldTokenId], {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 120,
        friction: 7,
      }).start();
      
      // Clear old token from slot
      setTokenToSlot(prev => {
        const next = { ...prev };
        delete next[oldTokenId];
        return next;
      });
    }
  };

  const attachPanResponder = (token: TokenSpec) => {
    if (!tokenAnimated[token.id]) tokenAnimated[token.id] = new Animated.ValueXY({ x: 0, y: 0 });

    return PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Only allow drag if no other token is being dragged
        return draggingTokenIdRef.current === null || draggingTokenIdRef.current === token.id;
      },
      onMoveShouldSetPanResponder: () => {
        // Also check on move to prevent other tokens from taking over
        return draggingTokenIdRef.current === null || draggingTokenIdRef.current === token.id;
      },
      onPanResponderTerminationRequest: () => {
        // Don't allow termination if this is the active drag
        return draggingTokenIdRef.current !== token.id;
      },
      onPanResponderGrant: (evt) => {
        // Prevent multiple drags
        if (draggingTokenIdRef.current !== null && draggingTokenIdRef.current !== token.id) {
          return;
        }
        
        draggingTokenIdRef.current = token.id;
        setDraggingTokenId(token.id);
        
        // Get current animated values (including any offset)
        const currentX = (tokenAnimated[token.id].x as any)._value || 0;
        const currentY = (tokenAnimated[token.id].y as any)._value || 0;
        const offsetX = (tokenAnimated[token.id].x as any)._offset || 0;
        const offsetY = (tokenAnimated[token.id].y as any)._offset || 0;
        const totalX = currentX + offsetX;
        const totalY = currentY + offsetY;
        
        // Store current total position as offset for the drag
        tokenAnimated[token.id].setOffset({ x: totalX, y: totalY });
        tokenAnimated[token.id].setValue({ x: 0, y: 0 });
        
        // Measure initial position immediately if not already stored
        if (!tokenInitialPositions.current[token.id]) {
          const tokenRef = tokenRefs.current[token.id];
          if (tokenRef) {
            (tokenRef as any).measureInWindow((x: number, y: number, width: number, height: number) => {
              tokenInitialPositions.current[token.id] = {
                x: x + width / 2,
                y: y + height / 2,
              };
            });
          }
        }
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow movement if this is the active dragging token
        if (draggingTokenIdRef.current !== token.id) {
          return;
        }
        
        // Follow finger directly - no magnetic effects during drag
        // The snap will happen on release
        tokenAnimated[token.id].setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        // Only process if this is the active dragging token
        if (draggingTokenIdRef.current !== token.id) {
          return;
        }
        
        // Flatten offset to get final position
        tokenAnimated[token.id].flattenOffset();
        
        const screenX = gesture.moveX;
        const screenY = gesture.moveY;
        const initialPos = tokenInitialPositions.current[token.id];
        
        // Re-measure all layouts immediately
        Object.entries(slotRefs.current).forEach(([slotId, ref]) => {
          if (ref) {
            (ref as any).measureInWindow((x: number, y: number, width: number, height: number) => {
              slotLayouts.current[slotId] = { x, y, width, height };
            });
          }
        });
        
        if (tokensRowRef.current) {
          (tokensRowRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
            bankLayout.current = { x, y, width, height };
          });
        }
        
        // Process drop - use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!initialPos) {
              // No initial position - force return to 0,0
              tokenAnimated[token.id].setValue({ x: 0, y: 0 });
              draggingTokenIdRef.current = null;
              setDraggingTokenId(null);
              return;
            }
            
            const dropZone = detectDropZone(screenX, screenY);
            
            // ONLY allow placement in slots - everything else goes back to bank
            if (dropZone.zone === 'slot' && dropZone.slotId && dropZone.slotCenter) {
              // Valid drop: on a slot - snap to center
              handleSlotReplacement(dropZone.slotId, token.id);
              
              const targetX = dropZone.slotCenter.x - initialPos.x;
              const targetY = dropZone.slotCenter.y - initialPos.y;
              
              Animated.spring(tokenAnimated[token.id], {
                toValue: { x: targetX, y: targetY },
                useNativeDriver: false,
                tension: 120,
                friction: 7,
              }).start();
              
              setTokenToSlot(prev => ({ ...prev, [token.id]: dropZone.slotId }));
            } else {
              // Invalid drop: not on a slot - FORCE return to bank (position 0,0)
              // This handles both 'bank' and 'middle' zones
              Animated.spring(tokenAnimated[token.id], {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 150,
                friction: 8,
              }).start(() => {
              // Double-check: ensure it's exactly at 0,0
              tokenAnimated[token.id].setValue({ x: 0, y: 0 });
            });
            
            setTokenToSlot(prev => {
              const next = { ...prev };
              delete next[token.id];
              return next;
            });
          }
          
          draggingTokenIdRef.current = null;
          setDraggingTokenId(null);
        });
      });
      },
    });
  };

  const handleSubmit = () => {
    if (showingExplanation) {
      // Continue to next step
      let numCorrect = 0;
      tokens.forEach(t => {
        if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
      });
      const explanation = isCorrect ? (correctExplanation || '') : (wrongExplanation || '');
      onSubmit({ 
        numCorrect, 
        total: tokens.length, 
        mapping: tokenToSlot,
        isCorrect,
        explanation
      });
    } else {
      // Submit and show explanation
      setSubmitted(true);
      let numCorrect = 0;
      tokens.forEach(t => {
        if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
      });
      const correct = numCorrect === tokens.length;
      setIsCorrect(correct);
      setShowingExplanation(true);
    }
  };

  // Expose submit handler via ref
  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, showingExplanation, tokenToSlot, isCorrect, correctExplanation, wrongExplanation, tokens]);

  // Notify parent about state changes
  useEffect(() => {
    if (onStateChange) {
      // Can submit if all tokens are placed in slots
      const allPlaced = tokens.every(t => tokenToSlot[t.id] !== undefined);
      onStateChange({
        showingExplanation,
        canSubmit: allPlaced && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, tokenToSlot, tokens]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {slots.slice(0, 2).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              // Store layout first
              slotLayouts.current[s.id] = { 
                x: layout.x, 
                y: layout.y, 
                width: layout.width, 
                height: layout.height 
              };
              // Then try to get window coordinates
              const ref = slotRefs.current[s.id];
              if (ref) {
                (ref as any).measureInWindow((x: number, y: number, width: number, height: number) => {
                  slotLayouts.current[s.id] = { x, y, width, height };
                });
              }
            }}
            style={styles.slotBox}>
            {renderSlotContent(s)}
            <View style={styles.slotUnderline} />
          </View>
        ))}
      </View>
      <View style={styles.topRow}>
        {slots.slice(2, 4).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              // Store layout first
              slotLayouts.current[s.id] = { 
                x: layout.x, 
                y: layout.y, 
                width: layout.width, 
                height: layout.height 
              };
              // Then try to get window coordinates
              const ref = slotRefs.current[s.id];
              if (ref) {
                (ref as any).measureInWindow((x: number, y: number, width: number, height: number) => {
                  slotLayouts.current[s.id] = { x, y, width, height };
                });
              }
            }}
            style={styles.slotBox}>
            {renderSlotContent(s)}
            <View style={styles.slotUnderline} />
          </View>
        ))}
      </View>
      <View 
        ref={tokensRowRef}
        style={styles.tokensRow}
        onLayout={(e) => {
          const layout = e.nativeEvent.layout;
          // Store layout first
          if (tokensRowRef.current) {
            (tokensRowRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
              bankLayout.current = { x, y, width, height };
            });
          } else {
            // Fallback to relative coordinates
            bankLayout.current = {
              x: layout.x,
              y: layout.y,
              width: layout.width,
              height: layout.height,
            };
          }
        }}
      >
        {tokens.map(t => {
          const pan = tokenAnimated[t.id] || new Animated.ValueXY({ x: 0, y: 0 });
          if (!tokenAnimated[t.id]) tokenAnimated[t.id] = pan;
          const responder = attachPanResponder(t);
          const isDragging = draggingTokenId === t.id;
          
          return (
            <React.Fragment key={t.id}>
              {/* Shadow/outline placeholder in bank when dragging */}
              {isDragging && tokenOriginalBankLayouts.current[t.id] && (
                <View
                  style={[
                    styles.tokenShadow,
                    {
                      position: 'absolute',
                      left: tokenOriginalBankLayouts.current[t.id].x,
                      top: tokenOriginalBankLayouts.current[t.id].y,
                      width: tokenOriginalBankLayouts.current[t.id].width,
                      height: tokenOriginalBankLayouts.current[t.id].height,
                    },
                  ]}
                />
              )}
              <Animated.View 
                ref={(ref: any) => (tokenRefs.current[t.id] = ref)}
                style={[styles.token, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} 
                {...responder.panHandlers}
                onLayout={(e) => {
                  const layout = e.nativeEvent.layout;
                  // Store layout
                  tokenLayouts.current[t.id] = {
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height,
                  };
                  
                  // Store original bank layout (only if not already stored)
                  // This represents where the token was originally positioned in the bank
                  if (!tokenOriginalBankLayouts.current[t.id]) {
                    tokenOriginalBankLayouts.current[t.id] = {
                      x: layout.x,
                      y: layout.y,
                      width: layout.width,
                      height: layout.height,
                    };
                  }
                  
                  // Try to get window coordinates for initial position
                  if (!tokenInitialPositions.current[t.id]) {
                    const ref = tokenRefs.current[t.id];
                    if (ref) {
                      (ref as any).measureInWindow((x: number, y: number, width: number, height: number) => {
                        tokenInitialPositions.current[t.id] = {
                          x: x + width / 2,
                          y: y + height / 2,
                        };
                      });
                    } else {
                      // Fallback to layout coordinates (relative to parent)
                      tokenInitialPositions.current[t.id] = {
                        x: layout.x + layout.width / 2,
                        y: layout.y + layout.height / 2,
                      };
                    }
                  }
                }}
              >
                <Text style={styles.tokenText}>{t.label}</Text>
              </Animated.View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  slotBox: {
    width: 120,
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  slotUnderline: {
    width: 70,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  tokensRow: {
    width: '100%',
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
    position: 'relative',
  },
  token: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 6,
  },
  tokenText: {
    color: '#0D2033',
    fontWeight: '700',
  },
  tokenShadow: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(61, 159, 255, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 18,
    margin: 6,
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


