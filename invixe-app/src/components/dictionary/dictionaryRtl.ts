import { type TextStyle } from "react-native";

/** Hebrew text styling (app-wide RTL is disabled via I18nManager). */
export const dictionaryTextRtl: TextStyle = {
  textAlign: "right",
  writingDirection: "rtl",
  width: "100%",
};
