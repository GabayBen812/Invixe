import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/** Legacy entry — immediately forwards to the unified Login screen. */
export default function WelcomeScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.replace("Login", { mode: "signin" });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#3372D8" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FB",
  },
});
