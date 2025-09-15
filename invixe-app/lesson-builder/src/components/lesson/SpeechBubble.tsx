import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface SpeechBubbleProps {
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function SpeechBubble({ message, buttonText, onButtonPress }: SpeechBubbleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
      {buttonText ? (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  bubble: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  text: { color: '#0D2033', fontSize: 16 },
  button: { marginTop: 10, backgroundColor: '#3F9FFF', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
