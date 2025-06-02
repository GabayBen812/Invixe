import React from "react";
import { ImageBackground, StyleSheet, ImageSourcePropType } from "react-native";

interface PageBackgroundProps {
  source: ImageSourcePropType;
  children: React.ReactNode;
  style?: any;
}

export default function PageBackground({
  source,
  children,
  style,
}: PageBackgroundProps) {
  return (
    <ImageBackground source={source} style={[styles.background, style]}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
