import React, { type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { DRILL_FLOATING_BUTTON_INSET } from "../../utils/drillFitLayout";

type Props = {
  children: ReactNode;
  gap?: number;
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Scrollable choice list that clears the floating submit button at the bottom. */
export default function DrillChoiceScrollArea({
  children,
  gap = 10,
  bottomInset = DRILL_FLOATING_BUTTON_INSET,
  contentStyle,
  style,
}: Props) {
  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        styles.content,
        { gap, paddingBottom: bottomInset },
        contentStyle,
      ]}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  content: {
    width: "100%",
    flexGrow: 1,
  },
});
