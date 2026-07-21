import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";
import OnboardingShell, {
  OnboardingOptionCard,
} from "../../components/onboarding/OnboardingShell";
import Svg, { Circle, Path } from "react-native-svg";

const TOTAL_STEPS = 3;

const goals = [
  { label: "הבנת שוק ההון", icon: "book" },
  { label: "השקעה לטווח ארוך", icon: "chart" },
  { label: "מסחר יומי", icon: "bolt" },
  { label: "ניתוח פונדמנטלי", icon: "search" },
] as const;

type Props = NativeStackScreenProps<RootStackParamList, "GoalSelect">;

function GoalIcon({ kind, color = "#3372D8" }: { kind: string; color?: string }) {
  switch (kind) {
    case "book":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 16.5v-11z"
            stroke={color}
            strokeWidth={1.8}
          />
          <Path d="M4 16.5h16" stroke={color} strokeWidth={1.8} />
        </Svg>
      );
    case "chart":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 19V5M4 19h16"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M8 15l3-4 3 2 4-6"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "bolt":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={1.8} />
          <Path
            d="M16 16l4 4"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
  }
}

export default function GoalSelectScreen({ navigation }: Props) {
  const { data, setGoal } = useRegistration();
  const [selected, setSelected] = useState(data.goal || "");

  return (
    <OnboardingShell
      step={2}
      totalSteps={TOTAL_STEPS}
      eyebrow="המטרה שלך"
      title="מה בא לך להשיג?"
      subtitle="כך נוכל להציע לך מסלול למידה שמתאים לסגנון שלך."
      onBack={() => navigation.navigate("AgeSelect")}
      ctaDisabled={!selected}
      onCta={() => {
        if (!selected) return;
        setGoal(selected);
        navigation.navigate("OnboardingFinish");
      }}
    >
      {goals.map((goal) => (
        <OnboardingOptionCard
          key={goal.label}
          label={goal.label}
          selected={selected === goal.label}
          onPress={() => setSelected(goal.label)}
          icon={
            <GoalIcon
              kind={goal.icon}
              color={selected === goal.label ? "#3372D8" : "#5B6B82"}
            />
          }
        />
      ))}
    </OnboardingShell>
  );
}
