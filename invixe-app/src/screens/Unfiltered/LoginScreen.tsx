import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import PageBackground from "../../components/ui/PageBackground";
import Button from "../../components/ui/Button";
import theme from "../../theme";
import Svg, { Path } from "react-native-svg";

const API_URL = "http://10.0.0.22:4000/api/login"; // Use your local IP

// Inline SVG logo as a React component
const InvixeLogo = () => (
  <View style={{ alignItems: "center", marginBottom: theme.spacing.xl }}>
    <Svg width={106} height={38} viewBox="0 0 106 38" fill="none">
      <Path d="M91.4316 11.7417L86.1475 10.2134L78.0723 27.313V27.5571L83.4365 37.0933H76.6816L73.4531 31.0337L70.3242 37.0933H63.4697L68.8838 27.5571L63.8174 18.02H70.6719L73.3564 23.7261L85.0752 4.00244L89.9014 7.03271L95.1221 0.561035L91.4316 11.7417ZM96.1699 17.4243C97.6104 17.4243 98.9148 17.6472 100.082 18.0942C101.249 18.5413 102.246 19.1918 103.074 20.0444C103.902 20.8888 104.539 21.915 104.986 23.1235C105.433 24.3322 105.657 25.6945 105.657 27.2095V28.7983H93.2393V29.0962C93.2393 29.7088 93.3684 30.2557 93.625 30.7358C93.8816 31.2158 94.2495 31.5926 94.7295 31.8657C95.2095 32.1389 95.7891 32.2758 96.4678 32.2759C96.9396 32.2759 97.3707 32.2091 97.7598 32.0767C98.1571 31.9442 98.4969 31.7537 98.7783 31.5054C99.0596 31.2488 99.266 30.9423 99.3984 30.5864H105.657C105.442 31.9109 104.933 33.0617 104.13 34.0386C103.327 35.0071 102.263 35.7602 100.938 36.2983C99.6223 36.8281 98.0826 37.0932 96.3193 37.0933C94.2829 37.0933 92.5273 36.7044 91.0537 35.9263C89.5886 35.1398 88.4587 34.0135 87.6641 32.5483C86.8777 31.0748 86.4844 29.3112 86.4844 27.2583C86.4844 25.2883 86.8821 23.5667 87.6768 22.0933C88.4715 20.6197 89.5933 19.4734 91.042 18.6538C92.4906 17.8343 94.1998 17.4244 96.1699 17.4243ZM7.82715 36.7456H0.972656V17.6724H7.82715V36.7456ZM23.8867 17.4243C25.2358 17.4244 26.4071 17.7343 27.4004 18.355C28.402 18.9675 29.1763 19.8121 29.7227 20.8882C30.2773 21.9644 30.5503 23.1942 30.542 24.5767V36.7456H23.6875V26.0171C23.6958 25.0735 23.456 24.3325 22.9678 23.7944C22.4877 23.2564 21.8169 22.9869 20.9561 22.9868C20.3932 22.9868 19.9007 23.1116 19.4785 23.3599C19.0646 23.5999 18.745 23.9475 18.5215 24.4028C18.2981 24.8498 18.1821 25.3881 18.1738 26.0171V36.7456H11.3193V17.6724H17.8262V21.2983H18.0254C18.4393 20.0897 19.1679 19.1417 20.2109 18.4546C21.2623 17.7676 22.4877 17.4243 23.8867 17.4243ZM41.9854 30.2886H42.1846L45.2637 17.6724H52.4658L46.0586 36.7456H38.1113L31.7041 17.6724H38.9062L41.9854 30.2886ZM61.2686 36.7456H54.4141V17.6724H61.2686V36.7456ZM96.3193 22.2417C95.7648 22.2417 95.2555 22.362 94.792 22.6021C94.3284 22.8338 93.9553 23.1569 93.6738 23.5708C93.4007 23.9847 93.2558 24.4694 93.2393 25.0239H99.3486C99.3404 24.4776 99.1999 23.9974 98.9268 23.5835C98.6619 23.1613 98.302 22.8338 97.8467 22.6021C97.3997 22.362 96.8905 22.2417 96.3193 22.2417ZM4.40039 9.42725C5.33564 9.42735 6.1303 9.7337 6.78418 10.3462C7.44631 10.9587 7.77729 11.6953 7.77734 12.5562C7.77734 13.4171 7.44645 14.1545 6.78418 14.7671C6.13033 15.3795 5.33557 15.6859 4.40039 15.686C3.47328 15.686 2.67787 15.3796 2.01562 14.7671C1.35335 14.1545 1.02246 13.4171 1.02246 12.5562C1.02251 11.6953 1.3535 10.9587 2.01562 10.3462C2.6779 9.73359 3.47321 9.42725 4.40039 9.42725ZM57.8418 9.42725C58.7771 9.42734 59.5717 9.73368 60.2256 10.3462C60.8877 10.9587 61.2187 11.6953 61.2188 12.5562C61.2188 13.4171 60.8879 14.1545 60.2256 14.7671C59.5717 15.3795 58.777 15.6859 57.8418 15.686C56.9147 15.686 56.1193 15.3796 55.457 14.7671C54.7948 14.1545 54.4639 13.4171 54.4639 12.5562C54.4639 11.6954 54.7949 10.9587 55.457 10.3462C56.1193 9.73359 56.9146 9.42725 57.8418 9.42725Z" fill="#3F9FFF"/>
    </Svg>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      navigation.navigate("Map");
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground source={require("../../assets/bg.png")}> 
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.logoWrap}>
          <InvixeLogo />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>התחברות</Text>
          <TextInput
            style={styles.input}
            placeholder="מספר טלפון"
            placeholderTextColor={theme.colors.trustBlueLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="סיסמה"
            placeholderTextColor={theme.colors.trustBlueLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.optimismOrange}
              style={{ marginTop: theme.spacing.md }}
            />
          ) : (
            <Button text="התחבר" onPress={handleLogin} />
          )}
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity onPress={() => navigation.navigate("Welcome")}
            style={styles.backBtn}>
            <Text style={styles.backBtnText}>חזרה</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: "center",
    marginTop: theme.spacing.xl * 1.5,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    alignItems: "center",
    shadowColor: theme.colors.trustBlueDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: theme.colors.primaryBlue,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  input: {
    width: 260,
    height: 48,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: theme.spacing.md,
    textAlign: "right",
    fontFamily: theme.font.family,
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.error,
    fontSize: 16,
    marginTop: theme.spacing.sm,
    fontFamily: theme.font.family,
    textAlign: "center",
  },
  backBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: theme.radius.lg,
  },
  backBtnText: {
    color: theme.colors.primaryBlue,
    fontSize: 18,
    fontFamily: theme.font.bold,
  },
});
