import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const Hammer = ({ color = "#E15637", ...props }: any) => (
  <View style={styles.shadow}>
    <Svg width={93} height={132} viewBox="0 0 93 132" fill="none" {...props}>
      <Path
        d="M46.25 104.75C47.5579 104.75 48.6181 103.69 48.6182 102.382V91.8633H63.5C66.8135 91.863 69.5 89.1768 69.5 85.8633V34.0742C69.4999 30.7608 66.8134 28.0745 63.5 28.0742H48.6182V21.3711C48.6182 20.0632 47.5579 19.002 46.25 19.002C44.9422 19.002 43.8821 20.0624 43.8818 21.3701V28.0742H29C25.6864 28.0742 23.0001 30.7606 23 34.0742V85.8633C23 89.177 25.6863 91.8633 29 91.8633H43.8818V102.382C43.8819 103.69 44.9421 104.75 46.25 104.75Z"
        fill={color}
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

export default Hammer;
