import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";

const goals = [
  {
    label: "הבנת שוק ההון",
    icon: require("../../assets/Characters/character_orange_noback.png"),
  },
  {
    label: "השקעה לטווח ארוך",
    icon: require("../../assets/Characters/character_orange_noback.png"),
  },
  {
    label: "מסחר יומי",
    icon: require("../../assets/Characters/character_orange_noback.png"),
  },
  {
    label: "ניתוח פונדמנטלי",
    icon: require("../../assets/Characters/character_orange_noback.png"),
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "GoalSelect">;

export default function GoalSelectScreen({ navigation }: Props) {
  const { setGoal } = useRegistration();
  const handleSelect = (goal: string) => {
    setGoal(goal);
    navigation.navigate("OnboardingFinish");
  };
  return (
    <ImageBackground
      source={require("../../assets/DefaultBlankBackground.png")}
      style={styles.bg}
    >
      <View style={styles.content}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>מה המטרה שלך בשוק ההון?</Text>
        </View>
        <Image
          source={require("../../assets/Characters/character_orange_noback.png")}
          style={styles.character}
        />
        <View style={styles.choices}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.label}
              style={styles.choice}
              onPress={() => handleSelect(goal.label)}
            >
              <Image source={goal.icon} style={styles.icon} />
              <Text style={styles.choiceText}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  speechText: { fontSize: 18, textAlign: "center", color: "#0F2233" },
  character: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 16,
  },
  choices: { width: "100%", alignItems: "center" },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3372D8",
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { width: 32, height: 32, marginRight: 16 },
  choiceText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
