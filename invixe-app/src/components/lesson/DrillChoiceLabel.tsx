import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import HtmlText from "../ui/HtmlText";
import {
  getDrillChoicePlainText,
  getDrillChoiceText,
  type ChoiceLike,
} from "../../utils/drillFitLayout";

type Props = {
  choice: ChoiceLike;
  color: string;
  style?: StyleProp<TextStyle>;
  /** Prefer plain Text when label has no meaningful HTML formatting. */
  preferPlain?: boolean;
};

/**
 * Renders drill answer labels reliably (builder HTML often hides text via white inline colors).
 */
export default function DrillChoiceLabel({
  choice,
  color,
  style,
  preferPlain = true,
}: Props) {
  const raw = getDrillChoiceText(choice);
  const plain = getDrillChoicePlainText(choice) || raw.replace(/<[^>]+>/g, " ").trim();

  if (!plain && !raw) {
    return null;
  }

  const useHtml =
    !preferPlain && raw.includes("<") && plain.length > 0 && plain !== raw.trim();

  if (useHtml) {
    return (
      <HtmlText value={raw} contentColor={color} style={style} />
    );
  }

  return (
    <Text
      style={[
        style,
        {
          color,
          textAlign: "center",
          fontWeight: "700",
          writingDirection: "rtl",
        },
      ]}
    >
      {plain}
    </Text>
  );
}
