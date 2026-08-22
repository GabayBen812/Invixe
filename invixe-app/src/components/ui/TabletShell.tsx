import React, { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

const TABLET_MAX_WIDTH = 480;

type Props = {
  children: ReactNode;
};

/** Keeps phone layout centered on iPad — functional, not polished. */
export default function TabletShell({ children }: Props) {
  const isIpad = Platform.OS === "ios" && Platform.isPad;

  if (!isIpad) {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#E3EEF9",
    alignItems: "center",
  },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: TABLET_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
  },
});
