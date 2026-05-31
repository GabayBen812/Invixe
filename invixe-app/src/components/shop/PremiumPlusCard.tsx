import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from "react-native-svg";
import theme from "../../theme";
import { PREMIUM_FEATURES } from "../../data/shopCatalog";

type Props = {
  onUpgrade: () => void;
};

function FeatureIcon({ type }: { type: (typeof PREMIUM_FEATURES)[0]["icon"] }) {
  const stroke = theme.colors.primary[600];
  switch (type) {
    case "block":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={2} />
          <Path d="M5 5l14 14" stroke={stroke} strokeWidth={2} />
        </Svg>
      );
    case "infinity":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "skip":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M5 5v14l11-7L5 5z" fill={stroke} />
          <Path d="M19 5v14" stroke={stroke} strokeWidth={2} />
        </Svg>
      );
    default:
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L14 8h6l-5 4 2 6-7-4-7 4 2-6-5-4h6l2-6z"
            stroke={stroke}
            strokeWidth={1.5}
            fill={stroke}
          />
        </Svg>
      );
  }
}

function ShieldArt() {
  return (
    <Svg width={100} height={120} viewBox="0 0 100 120">
      <Defs>
        <LinearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 8 L82 22 V58 C82 78 68 92 50 98 C32 92 18 78 18 58 V22 Z"
        fill="url(#shieldFill)"
      />
      <Path
        d="M50 28 L62 38 V54 C62 64 56 70 50 72 C44 70 38 64 38 54 V38 Z"
        fill="#FFFFFF"
        opacity={0.2}
      />
      <Path
        d="M50 36 L44 42 L46 50 L50 54 L54 50 L56 42 L50 36 Z"
        fill="#FCD34D"
        stroke="#F59E0B"
        strokeWidth={1}
      />
      <Rect x={30} y={100} width={40} height={8} rx={2} fill="#94A3B8" />
      <Rect x={24} y={108} width={52} height={6} rx={2} fill="#CBD5E1" />
    </Svg>
  );
}

export default function PremiumPlusCard({ onUpgrade }: Props) {
  return (
    <View style={styles.wrapper}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="premiumBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#EFF6FF" />
            <Stop offset="100%" stopColor="#DBEAFE" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={20} fill="url(#premiumBg)" />
      </Svg>

      <View style={styles.popularTag}>
        <Text style={styles.popularStar}>★</Text>
        <Text style={styles.popularText}>הכי פופולרי</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.leftCol}>
          <View style={styles.brandRow}>
            <Text style={styles.brandInvixe}>invixe</Text>
            <Text style={styles.brandPlus}>+</Text>
          </View>
          <Text style={styles.subtitle}>תוכן בלתי מוגבל</Text>

          <View style={styles.featuresRow}>
            {PREMIUM_FEATURES.map((f) => (
              <View key={f.id} style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <FeatureIcon type={f.icon} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.crown}>♛</Text>
            <Text style={styles.upgradeText}>שדרג עכשיו</Text>
          </Pressable>
        </View>

        <View style={styles.shieldCol}>
          <ShieldArt />
        </View>
      </View>

      <Text style={styles.socialProof}>
        המסלול המומלץ ביותר על ידי 78% מהמשתמשים 👥
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    minHeight: 220,
    backgroundColor: "#EFF6FF",
  },
  popularTag: {
    position: "absolute",
    top: 0,
    end: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
  },
  popularStar: {
    color: "#FCD34D",
    fontSize: 12,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: theme.font.bold,
  },
  body: {
    flexDirection: "row",
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 36,
    alignItems: "flex-start",
  },
  leftCol: {
    flex: 1,
    alignItems: "flex-end",
    paddingEnd: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  brandInvixe: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  brandPlus: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: "#F59E0B",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[700],
    marginTop: 4,
    textAlign: "right",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
    maxWidth: 220,
  },
  featureItem: {
    width: 48,
    alignItems: "center",
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  featureLabel: {
    fontSize: 9,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    textAlign: "center",
    marginTop: 4,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 14,
    alignSelf: "stretch",
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  crown: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  upgradeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.font.bold,
  },
  shieldCol: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  socialProof: {
    position: "absolute",
    bottom: 10,
    end: 16,
    start: 16,
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
  },
});
