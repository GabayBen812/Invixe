import React from "react";
import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity, Animated, Easing, I18nManager } from "react-native";
import CharacterPrimarySVG from './CharacterPrimarySVG';

interface SpeechBubbleProps {
  message: string;
  characterImg?: ImageSourcePropType;
  position?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'center';
  align?: 'flex-start' | 'flex-end' | 'center';
  buttonText?: string;
  onButtonPress?: () => void;
  typingSpeedMs?: number; // characters per tick
  disableTyping?: boolean; // show full text immediately
  disableEnterAnim?: boolean; // do not animate on mount (used for shadows)
}

export default function SpeechBubble({ message, characterImg, position = 'bottomLeft', align = 'center', buttonText, onButtonPress, typingSpeedMs = 18, disableTyping = false, disableEnterAnim = false }: SpeechBubbleProps) {
  // Horizontal alignment and speaker side
  let alignSelf: 'flex-start' | 'flex-end' | 'center' = 'center';
  const isLeft = position === 'bottomLeft' || position === 'topLeft';
  const isRight = position === 'bottomRight' || position === 'topRight';
  const isCenter = position === 'center';
  if (isLeft) alignSelf = 'flex-start';
  if (isRight) alignSelf = 'flex-end';
  if (isCenter) alignSelf = 'center';

  // Typing animation state
  const [typed, setTyped] = React.useState(disableTyping ? message : "");
  const [typing, setTyping] = React.useState(!disableTyping);
  const slideIn = React.useRef(new Animated.Value(20)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    setTyped(disableTyping ? message : "");
    setTyping(!disableTyping);
    if (disableEnterAnim) {
      slideIn.setValue(0);
      opacity.setValue(1);
    } else {
      Animated.parallel([
        Animated.timing(slideIn, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true })
      ]).start();
    }

    if (disableTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTyped((prev) => {
        const nextLen = Math.min(message.length, (prev?.length || 0) + 1);
        const next = message.slice(0, nextLen);
        if (nextLen === message.length) {
          clearInterval(interval);
          setTyping(false);
        }
        return next;
      });
    }, typingSpeedMs);
    return () => clearInterval(interval);
  }, [message, disableTyping, typingSpeedMs, disableEnterAnim]);

  // Typing dots animation
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!typing) return;
    const makeAnim = (v: Animated.Value, delay: number) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 350, useNativeDriver: true })
      ])
    ).start();
    makeAnim(dot1, 0);
    makeAnim(dot2, 150);
    makeAnim(dot3, 300);
    return () => { dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation(); };
  }, [typing]);

  const BubbleInner = (
    <Animated.View style={[styles.bubbleContainer, { alignSelf, transform: [{ translateY: slideIn }], opacity }]}> 
      {/* Decorative soft shadow wings */}
      {/* <View style={styles.shadowWingLeft} /> */}
      {/* <View style={styles.shadowWingRight} /> */}

      {/* Content row: avatar + text */}
      <View style={styles.row}> 
        <View style={styles.avatarWrap}>
          {characterImg ? (
            <Image source={characterImg} style={styles.avatar} />
          ) : (
            <CharacterPrimarySVG size={80} />
          )}
        </View>
        <View style={styles.messageArea}>
          <Text style={styles.text}>{typed}</Text>
          {/* Bottom row inside the bubble: dots + continue */}
          {(typing || buttonText) && (
            <View style={styles.bottomRow}>
              {typing && typed.length < message.length ? (
                <View style={styles.typingRow}>
                  <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                  <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                  <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                </View>
              ) : null}
              {buttonText ? (
                <TouchableOpacity style={styles.button} onPress={onButtonPress}>
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return BubbleInner;
}

const styles = StyleSheet.create({
  bubbleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'center',
    width: '94%',
    maxWidth: 480,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.12,
    // shadowRadius: 14,
    // elevation: 6,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterLeft: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginRight: 16,
  },
  characterRight: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginLeft: 16,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  messageArea: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 1,
  },
  text: {
    fontSize: 18,
    color: '#1e355e',
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 8,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A0AEC0',
  },
  button: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shadowWingLeft: {
    position: 'absolute',
    left: 18,
    bottom: -6,
    width: 34,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    transform: [{ rotate: '-8deg' }],
  },
  shadowWingRight: {
    position: 'absolute',
    right: 18,
    bottom: -6,
    width: 34,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    transform: [{ rotate: '8deg' }],
  },
});
