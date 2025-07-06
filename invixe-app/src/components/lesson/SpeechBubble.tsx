import React from "react";
import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from "react-native";

interface SpeechBubbleProps {
  message: string;
  characterImg?: ImageSourcePropType;
  position?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  align?: 'flex-start' | 'flex-end' | 'center';
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function SpeechBubble({ message, characterImg, position = 'bottomLeft', align = 'center', buttonText, onButtonPress }: SpeechBubbleProps) {
  // Horizontal alignment
  let alignSelf: 'flex-start' | 'flex-end' | 'center' = 'center';
  if (position === 'bottomLeft' || position === 'topLeft') alignSelf = 'flex-start';
  if (position === 'bottomRight' || position === 'topRight') alignSelf = 'flex-end';

  return (
    <View style={[styles.bubbleContainer, { alignSelf }]}>
      {characterImg && (
        <Image source={characterImg} style={styles.character} />
      )}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.text}>{message}</Text>
        {buttonText && (
          <TouchableOpacity style={styles.button} onPress={onButtonPress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
    marginLeft: 12,
    marginRight: 12,
    maxWidth: 380,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    // Removed position: 'absolute'
  },
  character: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginRight: 16,
  },
  text: {
    fontSize: 20,
    color: '#1e355e',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
