import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import theme from "../../theme";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function GuestModeBanner({ navigation }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        מצב אורח — ההתקדמות לא נשמרת וחלק מהתכונות חסומות.
      </Text>
      <Pressable
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: "Login" }] })
        }
        hitSlop={8}
      >
        <Text style={styles.link}>צור חשבון</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(180, 83, 9, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(180, 83, 9, 0.25)",
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: theme.font.family,
    color: "#92400E",
    textAlign: "right",
  },
  link: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: theme.colors.primaryBlue,
  },
});
