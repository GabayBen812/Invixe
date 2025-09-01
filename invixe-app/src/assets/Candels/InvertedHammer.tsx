import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const InvertedHammer = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={93} height={133} viewBox="0 0 93 133" fill="none" {...props}>
      <Path
        d="M47 106C47.5523 106 48 105.552 48 105V46.5957H63.5479C66.8346 46.5957 69.4999 43.9313 69.5 40.6445C69.5 37.3577 66.8347 34.6934 63.5479 34.6934H48V20C48 19.4477 47.5523 19 47 19C46.4477 19 46 19.4477 46 20V34.6934H28.9512C25.6644 34.6934 23 37.3578 23 40.6445C23.0001 43.9312 25.6645 46.5956 28.9512 46.5957H46V105C46 105.552 46.4477 106 47 106Z"
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

export default InvertedHammer;
