import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import CharacterPrimarySVG from './CharacterPrimarySVG';
import HtmlText from '../ui/HtmlText';

export interface DialogMessage {
  id: string;
  characterId?: string; // 'character1' | 'character2' | undefined for narrator
  text: string;
  delay?: number; // delay before showing this message
}

interface Props {
  messages: DialogMessage[];
  onComplete?: () => void;
  typingSpeed?: number; // milliseconds per character
  autoAdvance?: boolean; // automatically advance to next message
  autoAdvanceDelay?: number; // delay before auto-advancing
}

export default function Dialog({ 
  messages, 
  onComplete, 
  typingSpeed = 50, 
  autoAdvance = true,
  autoAdvanceDelay = 2000 
}: Props) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  const slideInAnim = new Animated.Value(50);
  const opacityAnim = new Animated.Value(0);

  const currentMessage = messages[currentMessageIndex];
  const messageHasHtml = currentMessage && /<[^>]+>/.test(currentMessage.text);

  useEffect(() => {
    if (currentMessage) {
      // Reset animations
      slideInAnim.setValue(50);
      opacityAnim.setValue(0);
      setShowMessage(true);

      // Animate message appearance
      Animated.parallel([
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (messageHasHtml) {
        setDisplayedText(currentMessage.text);
        setIsTyping(false);
        return;
      }

      setDisplayedText('');
      setIsTyping(true);

      // Type out the message
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < currentMessage.text.length) {
          setDisplayedText(currentMessage.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
          if (autoAdvance && currentMessageIndex < messages.length - 1) {
            setTimeout(() => {
              setCurrentMessageIndex(prev => prev + 1);
            }, autoAdvanceDelay);
          }
        }
      }, typingSpeed);

      return () => clearInterval(typeInterval);
    } else {
      // All messages completed
      onComplete?.();
    }
  }, [currentMessageIndex, currentMessage]);

  const handleNext = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const getCharacterColor = (characterId?: string) => {
    switch (characterId) {
      case 'character1': return '#3F9FFF';
      case 'character2': return '#62D24C';
      default: return '#6B7280';
    }
  };

  const getCharacterName = (characterId?: string) => {
    switch (characterId) {
      case 'character1': return 'מורה';
      case 'character2': return 'תלמיד';
      default: return 'מספר';
    }
  };

  if (!currentMessage) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.messageContainer,
          {
            transform: [{ translateY: slideInAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        {/* Character Avatar */}
        {currentMessage.characterId && (
          <View style={styles.characterContainer}>
            <View style={[styles.avatarContainer, { backgroundColor: getCharacterColor(currentMessage.characterId) + '20' }]}>
              <CharacterPrimarySVG size={60} />
            </View>
            <Text style={[styles.characterName, { color: getCharacterColor(currentMessage.characterId) }]}>
              {getCharacterName(currentMessage.characterId)}
            </Text>
          </View>
        )}

        {/* Message Bubble */}
        <View style={styles.bubbleContainer}>
          <View style={[styles.bubble, { backgroundColor: currentMessage.characterId ? '#FFFFFF' : '#F3F4F6' }]}>
            {messageHasHtml ? (
              <HtmlText
                value={displayedText}
                style={[styles.messageText, { color: currentMessage.characterId ? '#1F2937' : '#6B7280' }]}
              />
            ) : (
              <Text style={[styles.messageText, { color: currentMessage.characterId ? '#1F2937' : '#6B7280' }]}>
                {displayedText}
                {isTyping && <Text style={styles.cursor}>|</Text>}
              </Text>
            )}
          </View>
        </View>

        {/* Continue Button */}
        {!isTyping && (
          <View style={styles.buttonContainer}>
            <Text style={styles.continueButton} onPress={handleNext}>
              {currentMessageIndex < messages.length - 1 ? 'המשך' : 'סיום'}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '700',
  },
  bubbleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bubble: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  cursor: {
    color: '#3F9FFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
  continueButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F9FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    textAlign: 'center',
  },
});
