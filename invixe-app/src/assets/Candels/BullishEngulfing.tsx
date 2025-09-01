import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const BullishEngulfing = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={150} height={184} viewBox="0 0 150 184" fill="none" {...props}>
      {/* First candle (bearish) */}
      <Path
        d="M37.5 40C38.3284 40 39 40.6716 39 41.5L39 60L52.5 60C53.3284 60 54 60.6716 54 61.5C54 62.3284 53.3284 63 52.5 63L39 63L39 82C39 82.8284 38.3284 83.5 37.5 83.5C36.6716 83.5 36 82.8284 36 82L36 63L22.5 63C21.6716 63 21 62.3284 21 61.5C21 60.6716 21.6716 60 22.5 60L36 60L36 41.5C36 40.6716 36.6716 40 37.5 40Z"
        fill="#4CAF50"
      />
      {/* Second candle (bullish) - engulfing the first */}
      <Path
        d="M112.5 35C113.328 35 114 35.6716 114 36.5L114 55L127.5 55C128.328 55 129 55.6716 129 56.5C129 57.3284 128.328 58 127.5 58L114 58L114 77C114 77.8284 113.328 78.5 112.5 78.5C111.672 78.5 111 77.8284 111 77L111 58L97.5 58C96.6716 58 96 57.3284 96 56.5C96 55.6716 96.6716 55 97.5 55L111 55L111 36.5C111 35.6716 111.672 35 112.5 35Z"
        fill="#E15637"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 9.35,
    elevation: 5,
  },
});

export default BullishEngulfing;
