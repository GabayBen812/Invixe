import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Animated,
  Easing,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import PageBackground from "../../components/ui/PageBackground";
import theme from "../../theme";
import { useUser } from "../../context/UserContext";
import { useRegistration } from "../../../context/RegistrationContext";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { API_BASE_URL } from "../../config/api";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import { isGoogleAuthConfigured } from "../../config/auth";
import {
  getSocialAuthErrorMessage,
  shouldShowAppleSignIn,
  signInWithApple,
  signInWithGoogle,
  type SocialAuthResult,
} from "../../services/socialAuth";

const API_URL = `${API_BASE_URL}/login`;

type AuthMode = "signin" | "signup";
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const AUTH = {
  brand: theme.colors.primary[500],
  brandSoft: theme.colors.primary[400],
  ink: theme.colors.neutral[900],
  muted: theme.colors.neutral[500],
  label: theme.colors.neutral[700],
  field: "#F1F5FB",
  fieldBorder: "#E1E9F4",
  card: "#FFFFFF",
};

function MailIcon({ color = "#94A3B8" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M4 7.5L12 13l8-5.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color = "#94A3B8" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M8 10V7.5a4 4 0 018 0V10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="15" r="1.3" fill={color} />
    </Svg>
  );
}

function UserIcon({ color = "#94A3B8" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={1.8} />
      <Path
        d="M5 19c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function EyeIcon({
  open,
  color = "#94A3B8",
}: {
  open: boolean;
  color?: string;
}) {
  if (open) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
          stroke={color}
          strokeWidth={1.8}
        />
        <Circle cx="12" cy="12" r="2.8" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18M10.5 10.7A2.8 2.8 0 0012 14.8c.5 0 1-.1 1.4-.4M7.1 7.4C5 8.8 3.5 11 3.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.3 4.2-.8M14.2 6.1c.9.3 1.7.7 2.4 1.2C19 8.8 20.5 11 20.5 12c0 .4-.3 1.2-.9 2.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronLeft({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5 6l-6 6 6 6"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function LoginScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const initialMode: AuthMode = route.params?.mode === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState("");
  const { setCurrentUser } = useUser();
  const { setPhone, setPassword: setRegPassword, setFirstName, setLastName } =
    useRegistration();

  const floatAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mode, contentAnim]);

  const copy = useMemo(
    () =>
      mode === "signup"
        ? {
            title: "ברוך הבא ל-Invixe",
            subtitle: "צור חשבון והתחל ללמוד שוק הון בדרך פשוטה ומהנה.",
            cta: "צור חשבון",
          }
        : {
            title: "טוב לראות אותך שוב",
            subtitle: "התחבר כדי להמשיך מאיפה שעצרת.",
            cta: "התחבר",
          },
    [mode],
  );

  const getHebrewError = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("network") || lower.includes("failed to fetch"))
      return "שגיאת רשת, אנא בדקו את החיבור";
    if (lower.includes("user") && lower.includes("not found"))
      return "משתמש לא נמצא";
    if (lower.includes("password") || lower.includes("credentials"))
      return "סיסמה שגויה";
    if (lower.includes("invalid") || lower.includes("missing"))
      return "פרטים שגויים, אנא נסו שוב";
    return "שגיאה בהתחברות, אנא נסו שוב";
  };

  const validate = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "נא להזין אימייל";
    if (!trimmedEmail.includes("@")) return "כתובת אימייל לא תקינה";
    if (!password || password.length < 4) return "סיסמה קצרה מדי";
    if (mode === "signup" && !fullName.trim()) return "נא להזין שם מלא";
    return "";
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: email.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      const data = await res.json();
      await setCurrentUser(data.phone || email.trim(), {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      navigation.reset({ index: 0, routes: [{ name: "Map", params: {} }] });
    } catch (e: any) {
      setError(getHebrewError(e.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ");
    setPhone(email.trim());
    setRegPassword(password);
    setFirstName(first);
    setLastName(last);
    navigation.navigate("AgeSelect");
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (mode === "signin") {
      await handleSignIn();
    } else {
      handleSignUp();
    }
  };

  const completeSocialLogin = async (
    provider: "google" | "apple",
    signIn: () => Promise<SocialAuthResult>,
  ) => {
    if (loading || socialLoading) return;
    setError("");
    setSocialLoading(provider);
    try {
      const result = await signIn();

      if (result.needsOnboarding) {
        setPhone(result.phone);
        setRegPassword("");
        setFirstName(result.firstName?.trim() || "");
        setLastName(result.lastName?.trim() || "");
        navigation.navigate("AgeSelect");
        return;
      }

      await setCurrentUser(result.phone, {
        firstName: result.firstName ?? undefined,
        lastName: result.lastName ?? undefined,
      });
      navigation.reset({ index: 0, routes: [{ name: "Map", params: {} }] });
    } catch (e: unknown) {
      const message = getSocialAuthErrorMessage(e);
      if (message) {
        setError(message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isGoogleAuthConfigured()) {
      setError("התחברות Google לא הוגדרה עדיין");
      return;
    }
    void completeSocialLogin("google", signInWithGoogle);
  };

  const handleAppleSignIn = () => {
    void completeSocialLogin("apple", signInWithApple);
  };

  const showAppleButton = shouldShowAppleSignIn();
  const isBusy = loading || socialLoading !== null;

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  return (
    <PageBackground source={require("../../assets/DefaultBlankBackground.png")}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              // Clear Dynamic Island / notch — mascot sits below safe top.
              paddingTop: Math.max(insets.top + 20, 52),
              paddingBottom: Math.max(insets.bottom + 20, 28),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.mascotWrap, { transform: [{ translateY: floatY }] }]}
          >
            <Image
              source={require("../../assets/Characters/auth_mascot.png")}
              style={styles.mascot}
            />
          </Animated.View>

          <Animated.View
            style={{
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </Animated.View>

          <View style={styles.segment}>
            <Pressable
              style={[styles.segmentBtn, mode === "signin" && styles.segmentActive]}
              onPress={() => {
                setError("");
                setMode("signin");
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "signin" && styles.segmentTextActive,
                ]}
              >
                כבר רשום? התחברות
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, mode === "signup" && styles.segmentActive]}
              onPress={() => {
                setError("");
                setMode("signup");
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "signup" && styles.segmentTextActive,
                ]}
              >
                חדש כאן? הרשמה
              </Text>
            </Pressable>
          </View>

          {mode === "signup" && (
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>שם מלא</Text>
              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  placeholder="ישראל ישראלי"
                  placeholderTextColor="#A9B4C6"
                  value={fullName}
                  onChangeText={setFullName}
                  textAlign="right"
                  autoCapitalize="words"
                />
                <UserIcon />
              </View>
            </View>
          )}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>אימייל</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#A9B4C6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="right"
              />
              <MailIcon />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>סיסמה</Text>
            <View style={styles.field}>
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                style={styles.eyeBtn}
              >
                <EyeIcon open={showPassword} />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A9B4C6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textAlign="right"
              />
              <LockIcon />
            </View>
          </View>

          {mode === "signin" && (
            <Pressable
              onPress={() =>
                Alert.alert(
                  "שחזור סיסמה",
                  "בקרוב נוסיף שחזור סיסמה. בינתיים פנו לתמיכה.",
                )
              }
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>שכחת סיסמה?</Text>
            </Pressable>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          {loading ? (
            <ActivityIndicator
              size="large"
              color={AUTH.brand}
              style={{ marginTop: 18 }}
            />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.cta,
                pressed && { transform: [{ scale: 0.98 }] },
                isBusy && styles.ctaDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isBusy}
            >
              <Text style={styles.ctaText}>{copy.cta}</Text>
              <ChevronLeft />
            </Pressable>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>או המשך עם</Text>
            <View style={styles.dividerLine} />
          </View>

          <View
            style={[
              styles.socialRow,
              !showAppleButton && styles.socialRowSingle,
            ]}
          >
            {showAppleButton ? (
              <Pressable
                style={[styles.socialBtn, isBusy && styles.socialBtnDisabled]}
                onPress={handleAppleSignIn}
                disabled={isBusy}
              >
                {socialLoading === "apple" ? (
                  <ActivityIndicator color={AUTH.ink} size="small" />
                ) : (
                  <>
                    <Text style={styles.socialApple}></Text>
                    <Text style={styles.socialText}>Apple</Text>
                  </>
                )}
              </Pressable>
            ) : null}
            <Pressable
              style={[
                styles.socialBtn,
                !showAppleButton && styles.socialBtnFull,
                isBusy && styles.socialBtnDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={isBusy}
            >
              {socialLoading === "google" ? (
                <ActivityIndicator color={AUTH.ink} size="small" />
              ) : (
                <>
                  <Text style={styles.socialGoogle}>G</Text>
                  <Text style={styles.socialText}>Google</Text>
                </>
              )}
            </Pressable>
          </View>

          <Text style={styles.legal}>
            בהמשך אתה מאשר את תנאי השימוש ומדיניות הפרטיות. התוכן לימודי בלבד
            ואינו ייעוץ פיננסי.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  mascotWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  mascot: {
    width: 96,
    height: 96,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontFamily: theme.font.bold,
    color: AUTH.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.font.family,
    color: AUTH.muted,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  segment: {
    flexDirection: "row-reverse",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(51,114,216,0.08)",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: AUTH.card,
    shadowColor: "#1F3A80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: "#8A97AB",
    textAlign: "center",
  },
  segmentTextActive: {
    fontFamily: theme.font.bold,
    color: AUTH.brand,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: AUTH.label,
    textAlign: "right",
    marginBottom: 6,
    marginRight: 4,
  },
  field: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: AUTH.field,
    borderWidth: 1.6,
    borderColor: AUTH.fieldBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    fontFamily: theme.font.family,
    color: AUTH.ink,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 2,
  },
  forgotWrap: {
    alignSelf: "flex-start",
    marginBottom: 4,
    marginTop: -2,
  },
  forgot: {
    color: AUTH.brandSoft,
    fontFamily: theme.font.bold,
    fontSize: 14,
  },
  error: {
    color: theme.colors.error[600],
    fontSize: 14,
    marginTop: 8,
    fontFamily: theme.font.family,
    textAlign: "center",
  },
  cta: {
    marginTop: 18,
    backgroundColor: AUTH.brand,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: AUTH.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 5,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: theme.font.bold,
  },
  ctaDisabled: {
    opacity: 0.65,
  },
  dividerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(15,34,51,0.1)",
  },
  dividerText: {
    color: AUTH.muted,
    fontSize: 13,
    fontFamily: theme.font.family,
  },
  socialRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  socialRowSingle: {
    flexDirection: "column",
  },
  socialBtn: {
    flex: 1,
    backgroundColor: AUTH.card,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: AUTH.fieldBorder,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row-reverse",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  socialBtnFull: {
    flex: 0,
    width: "100%",
  },
  socialBtnDisabled: {
    opacity: 0.65,
  },
  socialText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: AUTH.ink,
  },
  socialApple: {
    fontSize: 18,
    color: AUTH.ink,
  },
  socialGoogle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#EA4335",
  },
  legal: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 18,
    color: "#93A0B3",
    textAlign: "center",
    fontFamily: theme.font.family,
    paddingHorizontal: 6,
  },
});
