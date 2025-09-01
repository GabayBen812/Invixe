import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const GravestoneDoji = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={102} height={184} viewBox="0 0 102 184" fill="none" {...props}>
      <Path
        d="M49.5283 19C50.372 19.0002 51.0557 19.6846 51.0557 20.5283L51.0557 33L77.5 33C78.3284 33 79 33.6716 79 34.5C79 35.3284 78.3284 36 77.5 36L51.0557 36L51.0556 155.472C51.0556 156.315 50.372 157 49.5283 157C48.6845 157 48 156.316 48 155.472L48 36L24.5 36C23.6716 36 23 35.3284 23 34.5C23 33.6716 23.6716 33 24.5 33L48 33L48 20.5283C48 19.6845 48.6845 19 49.5283 19Z"
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

export default GravestoneDoji;
