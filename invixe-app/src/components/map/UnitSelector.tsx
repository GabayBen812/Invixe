import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import theme from "../../theme";
import ProgressBar from "./ProgressBar";
import CourseCard from "./CourseCard";
import { AppCharacterSVG, TechnicalAnalysisIcon, TradingIcon, InvestmentIcon, FundamentalIcon } from "./MapAssets";
import { useLessons } from "../../context/LessonsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

type UnitSelectorProps = {
  completedLessons: number[];
  onSelectUnit: (idx: number) => void;
};

export default function UnitSelector({ completedLessons, onSelectUnit }: UnitSelectorProps) {
  const { lessonsRegistry } = useLessons();
  const unitProgress = React.useMemo(() => {
    return lessonsRegistry.map((step) => {
      const total = step.lessons.length;
      const done = step.lessons.filter((l) => completedLessons.includes(l.id)).length;
      return { total, done, pct: total > 0 ? done / total : 0 };
    });
  }, [completedLessons, lessonsRegistry]);

  const { overallProgress, totalCompleted, totalLessons } = React.useMemo(() => {
    const total = lessonsRegistry.flatMap((s) => s.lessons).length;
    const done = lessonsRegistry.flatMap((s) => s.lessons).filter((l) => completedLessons.includes(l.id)).length;
    return { overallProgress: total > 0 ? done / total : 0, totalCompleted: done, totalLessons: total };
  }, [completedLessons, lessonsRegistry]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>ברוך הבא יונתן!</Text>
              <Text style={styles.heroSubtitle}>בחר קורס להתחיל או להמשיך</Text>
            </View>
            <View style={styles.heroIconContainer}>
              <AppCharacterSVG size={92} />
            </View>
          </View>
          {/* <View style={styles.overallProgressContainer}>
            <View style={styles.overallProgressInfoRow}>
              <Text style={styles.overallProgressText}>התקדמות כללית</Text>
              <Text style={styles.overallProgressPercentage}>{Math.round(overallProgress * 100)}%</Text>
            </View>
            <View style={styles.overallProgressBar}>
              <ProgressBar progress={overallProgress} width={SCREEN_WIDTH - 64} />
            </View>
            <Text style={styles.overallProgressDetails}>{totalCompleted} מתוך {totalLessons} שיעורים הושלמו</Text>
          </View> */}
        </View>

        <View style={styles.unitCardsContainer}>
          {lessonsRegistry.map((step, idx) => {
            const title =
              step.step === 1
                ? "מבוא לשוק ההון"
                : step.step === 2
                ? "ניתוח טכני"
                : step.step === 3
                ? "השקעות לטווח ארוך"
                : "ניתוח פונדמנטלי";
            const subtitle =
              step.step === 1
                ? "קריאת גרפים, מגמות ואיתותים"
                : step.step === 2
                ? "איך שוק עובד, סוגי פקודות וסיכונים"
                : step.step === 3
                ? "אסטרטגיות DCA, פיזור וניהול סיכונים"
                : "קריאת דוחות, מכפילים ויתרון תחרותי";
            const badge = idx === 0 ? "מומלץ להתחלה" : undefined;
            const comingSoon = step.step === 4; // "ניתוח פונדמנטלי"
            const level = step.step <= 2 ? "בסיסי" : "מתקדם";
            const duration = step.step === 1 ? "כ-60 דק׳" : step.step === 2 ? "כ-45 דק׳" : "כ-50 דק׳";
            const IconComp =
              step.step === 1
                ? TradingIcon
                : step.step === 2
                ? TechnicalAnalysisIcon
                : step.step === 3
                ? InvestmentIcon
                : FundamentalIcon;
            return (
              <CourseCard
                key={`unit-${idx}`}
                title={title}
                subtitle={subtitle}
                Icon={IconComp}
                badgeText={badge}
                comingSoon={comingSoon}
                levelChip={level}
                durationChip={duration}
                levelEmphasis={"filled"}
                onPress={() => onSelectUnit(idx)}
              />
            );
          })}
        </View>

        {/* <View style={styles.bottomInfo}>
          <View style={styles.infoIcon}><Text style={styles.infoIconText}>💡</Text></View>
          <Text style={styles.bottomInfoText}>כל קורס זמין לך — בחר מה שמעניין אותך</Text>
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    // paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    // elevation: 1,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  heroIconContainer: { marginBottom: 6 },
  heroTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 2,
    textAlign: "right",
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "right",
    marginBottom: 12,
    lineHeight: 16,
  },
  overallProgressContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },
  overallProgressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  overallProgressText: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: "#475569",
  },
  overallProgressPercentage: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },
  overallProgressBar: { marginBottom: 3, alignItems: "center" },
  overallProgressDetails: {
    fontSize: 9,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "center",
  },
  unitCardsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    gap: 12,
    alignItems: "stretch",
  },
  bottomInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#00A5E9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CEF6FF",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoIconText: { fontSize: 16 },
  bottomInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.font.family,
    color: "gray",
    textAlign: "right",
  },
});


