import { ImageBackground, StyleSheet, type ImageSourcePropType } from "react-native";

export default function PageBackground({ source, children }: { source: ImageSourcePropType; children?: React.ReactNode }) {
  return (
    <ImageBackground source={source} style={styles.bg}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%'
  }
});
