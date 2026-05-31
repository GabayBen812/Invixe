import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useUser } from "../../context/UserContext";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const { isHydrating, currentUserEmail } = useUser();

  useEffect(() => {
    if (isHydrating) return;

    const timer = setTimeout(() => {
      navigation.replace(currentUserEmail ? "Map" : "Welcome");
    }, 500);

    return () => clearTimeout(timer);
  }, [isHydrating, currentUserEmail, navigation]);

  return (
    <ImageBackground
      source={require("../../assets/DefaultBlankBackground.png")}
      style={styles.bg}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/Characters/character_orange_noback.png")}
          style={styles.character}
        />
        <Text style={styles.title}>Invixe</Text>
        <ActivityIndicator
          size="large"
          color="#3372D8"
          style={{ marginTop: 24 }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  character: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3372D8",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
