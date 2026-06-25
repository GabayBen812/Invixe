import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import HtmlText from "../ui/HtmlText";
import { useLessonTheme } from "../../context/LessonThemeContext";
import { toPlainDisplayText } from "../../utils/decodeHtmlEntities";

export interface MultiSelectOption {
  id: string;
  label?: string;
  imageSource?: any;
  correct: boolean;
}

interface Props {
  title?: string;
  options: MultiSelectOption[];
  layout?: "grid" | "list";
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: {
    selectedIds: string[];
    numCorrectSelections: number;
    perOptionCorrectness: Record<string, boolean>;
    allCorrect: boolean;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function MultiSelectDrill({
  title,
  options,
  layout = "grid",
  submitText = "בדוק",
  correctExplanation,
  wrongExplanation,
  onSubmit,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected],
  );

  const perOptionCorrectness = useMemo(() => {
    const res: Record<string, boolean> = {};
    options.forEach((o) => {
      const picked = !!selected[o.id];
      // correctness per option: if picked, it is correct only if option.correct
      // if not picked and option.correct, then it's an error
      res[o.id] = (picked && o.correct) || (!picked && !o.correct);
    });
    return res;
  }, [selected, options]);

  const numCorrectSelections = useMemo(() => {
    let count = 0;
    options.forEach((o) => {
      const picked = !!selected[o.id];
      if (picked && o.correct) count += 1;
    });
    return count;
  }, [selected, options]);

  const allCorrect = useMemo(
    () => Object.values(perOptionCorrectness).every(Boolean),
    [perOptionCorrectness],
  );

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = allCorrect;
    setIsCorrect(correct);
    setShowingExplanation(true);
  };

  const handleContinue = () => {
    const explanation = isCorrect
      ? correctExplanation || ""
      : wrongExplanation || "";
    onSubmit({
      selectedIds,
      numCorrectSelections,
      perOptionCorrectness,
      allCorrect,
      isCorrect,
      explanation,
    });
  };

  return (
    <View style={styles.container}>
      {title ? (
        <HtmlText
          value={title}
          style={[styles.title, isPractice && { color: theme.instructionText }]}
        />
      ) : null}
      <View
        style={[
          styles.optionsContainer,
          layout === "grid" ? styles.grid : styles.list,
        ]}
      >
        {options.map((opt, index) => {
          const picked = !!selected[opt.id];
          const isCorrectAfterSubmit = submitted
            ? perOptionCorrectness[opt.id]
            : undefined;
          const bg = submitted
            ? (picked && opt.correct) || (!picked && !opt.correct)
              ? theme.choiceCorrectBg
              : theme.choiceWrongBg
            : picked
              ? isPractice
                ? theme.choiceSelectedBg
                : "#3F9FFF"
              : isPractice
                ? theme.choiceBg
                : "#FFFFFF";
          const textColor =
            submitted || picked ? "#FFFFFF" : isPractice ? theme.choiceText : "#0D2033";
          return (
            <Pressable
              key={`${opt.id}-${index}`}
              onPress={() => toggle(opt.id)}
              style={[
                styles.optionCard,
                { backgroundColor: bg },
                isPractice &&
                  !submitted &&
                  !picked && {
                    borderWidth: 1,
                    borderColor: theme.choiceBorder,
                  },
              ]}
            >
              {opt.imageSource ? (
                <Image source={opt.imageSource} style={styles.image} />
              ) : null}
              {opt.label ? (
                <Text style={[styles.optionLabel, { color: textColor }]}>
                  {toPlainDisplayText(opt.label)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[
          styles.submitButton,
          isPractice && { backgroundColor: theme.confirmButtonBg },
        ]}
        onPress={showingExplanation ? handleContinue : handleSubmit}
      >
        <Text style={styles.submitText}>
          {showingExplanation ? "המשך" : submitText}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D2033",
    marginBottom: 10,
  },
  optionsContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  list: {
    flexDirection: "column",
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 8,
    resizeMode: "contain",
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
