import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";
import OnboardingShell, {
  OnboardingOptionCard,
} from "../../components/onboarding/OnboardingShell";
import Svg, { Circle, Path } from "react-native-svg";

const TOTAL_STEPS = 3;

const ageGroups = [
  { label: "מתחת ל-18", icon: "sprout" },
  { label: "18-24", icon: "bolt" },
  { label: "25-34", icon: "rocket" },
  { label: "35-44", icon: "target" },
  { label: "45-54", icon: "compass" },
  { label: "55+", icon: "star" },
] as const;

type Props = NativeStackScreenProps<RootStackParamList, "AgeSelect">;

function AgeIcon({ kind, color = "#3372D8" }: { kind: string; color?: string }) {
  switch (kind) {
    case "sprout":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 20V11M12 11C12 7 9 4 5 4c0 4 3 7 7 7zm0 0c0-4 3-7 7-7 0 4-3 7-7 7z"
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
    case "rocket":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 15l-2 6 6-2M14 4l6 6M9.5 14.5L14 10"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M14 4c2.5 1 5.5 4 6.5 6.5-2.5 1-5.5 4-6.5 6.5C12 14.5 9.5 11.5 8 9c1.5-1.5 4.5-4 6-5z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "target":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
          <Circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth={1.8} />
          <Circle cx="12" cy="12" r="1.5" fill={color} />
        </Svg>
      );
    case "compass":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
          <Path
            d="M14.8 9.2l-1.6 4.8-4.8 1.6 1.6-4.8 4.8-1.6z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3l2.2 5.4L20 9l-4.4 3.6L17 19l-5-3.2L7 19l1.4-6.4L4 9l5.8-.6L12 3z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

export default function AgeSelectScreen({ navigation }: Props) {
  const { data, setAgeGroup } = useRegistration();
  const [selected, setSelected] = useState(data.ageGroup || "");

  return (
    <OnboardingShell
      step={1}
      totalSteps={TOTAL_STEPS}
      eyebrow="קצת עליך"
      title="בן כמה אתה?"
      subtitle="נתאים את קצב הלמידה והדוגמאות לגיל שלך."
      onBack={() => navigation.navigate("Login", { mode: "signup" })}
      ctaDisabled={!selected}
      onCta={() => {
        if (!selected) return;
        setAgeGroup(selected);
        navigation.navigate("GoalSelect");
      }}
    >
      {ageGroups.map((group) => (
        <OnboardingOptionCard
          key={group.label}
          label={group.label}
          selected={selected === group.label}
          onPress={() => setSelected(group.label)}
          icon={
            <AgeIcon
              kind={group.icon}
              color={selected === group.label ? "#3372D8" : "#5B6B82"}
            />
          }
        />
      ))}
    </OnboardingShell>
  );
}
