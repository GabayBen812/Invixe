import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const LongLeggedDoji = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={102} height={184} viewBox="0 0 102 184" fill="none" {...props}>
      <Path
        d="M52.5283 19C53.372 19.0002 54.0557 19.6846 54.0557 20.5283L54.0557 85L77.5 85C78.3284 85 79 85.6716 79 86.5C79 87.3284 78.3284 88 77.5 88L54.0557 88L54.0556 155.472C54.0556 156.315 53.372 157 52.5283 157C51.6845 157 51 156.316 51 155.472L51 88L24.5 88C23.6716 88 23 87.3284 23 86.5C23 85.6716 23.6716 85 24.5 85L51 85L51 20.5283C51 19.6845 51.6845 19 52.5283 19Z"
        fill="black"
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

export default LongLeggedDoji;
