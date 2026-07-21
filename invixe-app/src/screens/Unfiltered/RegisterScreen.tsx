import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

/** Legacy route — redirects into the unified Auth screen in signup mode. */
export default function RegisterScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.replace("Login", { mode: "signup" });
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#3372D8" />
    </View>
  );
}
