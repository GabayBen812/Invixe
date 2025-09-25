import React, { useState, useEffect } from 'react';

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

export default function MockDialog({ 
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

  const currentMessage = messages[currentMessageIndex];

  useEffect(() => {
    if (currentMessage) {
      setDisplayedText('');
      setIsTyping(true);
      setShowMessage(true);

      // Type out the message
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < currentMessage.text.length) {
          setDisplayedText(currentMessage.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
          
          // Auto advance to next message
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
  }, [currentMessageIndex, currentMessage, autoAdvance, autoAdvanceDelay, typingSpeed, messages.length]);

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
    <div className="flex-1 flex justify-center items-center px-5">
      <div className="w-full max-w-md flex flex-col items-center animate-slide-up">
        {/* Character Avatar */}
        {currentMessage.characterId && (
          <div className="flex flex-col items-center mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: getCharacterColor(currentMessage.characterId) + '20' }}
            >
              {/* Character SVG placeholder */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: getCharacterColor(currentMessage.characterId) }}
              >
                {currentMessage.characterId === 'character1' ? 'מ' : 'ת'}
              </div>
            </div>
            <div 
              className="text-base font-bold"
              style={{ color: getCharacterColor(currentMessage.characterId) }}
            >
              {getCharacterName(currentMessage.characterId)}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className="w-full flex justify-center">
          <div 
            className="rounded-2xl py-4 px-5 min-h-[60px] flex items-center justify-center shadow-lg"
            style={{ 
              backgroundColor: currentMessage.characterId ? '#FFFFFF' : '#F3F4F6',
              color: currentMessage.characterId ? '#1F2937' : '#6B7280'
            }}
          >
            <div className="text-lg font-semibold text-center leading-6">
              {displayedText}
              {isTyping && <span className="text-blue-500 font-bold">|</span>}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {!isTyping && (
          <div className="mt-5">
            <button 
              onClick={handleNext}
              className="text-base font-bold text-blue-500 py-3 px-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {currentMessageIndex < messages.length - 1 ? 'המשך' : 'סיום'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
