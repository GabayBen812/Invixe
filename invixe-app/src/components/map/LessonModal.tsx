import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MODAL_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.85);

type Lesson = {
  id: number;
  title: string;
  description?: string;
  lessonType?: "info" | "memorize" | "practice" | "test";
  sublessons?: Lesson[];
};

type LessonAttempt = {
  lessonId: number;
  attempts: number;
  lastAttempted: Date | string;
  completed?: boolean;
};

type LessonModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedMainLesson: Lesson | null;
  completedLessons: number[];
  lessonAttempts: LessonAttempt[];
  onStart: (lessonId: number) => void;
  comingSoon?: boolean;
};

function CheckIcon({ color = theme.colors.white, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color = theme.colors.neutral[400], size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 11V8a5 5 0 0110 0v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M6 11h12v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlayIcon({ color = theme.colors.white, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5v14l11-7L8 5z" fill={color} />
    </Svg>
  );
}

function CloseIcon({ color = theme.colors.neutral[500], size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function LessonModal({
  visible,
  onClose,
  selectedMainLesson,
  completedLessons,
  lessonAttempts: _lessonAttempts,
  onStart,
  comingSoon = false,
}: LessonModalProps) {
  const progress = React.useMemo(() => {
    if (!selectedMainLesson) return 0;
    if (!selectedMainLesson.sublessons) {
      return completedLessons.includes(selectedMainLesson.id) ? 1 : 0;
    }
    const total = selectedMainLesson.sublessons.length;
    const done = selectedMainLesson.sublessons.filter((l) =>
      completedLessons.includes(l.id)
    ).length;
    return total > 0 ? done / total : 0;
  }, [selectedMainLesson, completedLessons]);

  const doneCount = React.useMemo(() => {
    if (!selectedMainLesson?.sublessons) return 0;
    return selectedMainLesson.sublessons.filter((l) =>
      completedLessons.includes(l.id)
    ).length;
  }, [selectedMainLesson, completedLessons]);

  const totalCount = selectedMainLesson?.sublessons?.length ?? 0;
  const progressPct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  if (!visible) return null;
  if (!comingSoon && !selectedMainLesson) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="סגור"
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed && styles.modalCloseButtonPressed,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="סגור"
            >
              <CloseIcon />
            </Pressable>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {comingSoon ? "עוד שיעורים בדרך" : selectedMainLesson!.title}
              </Text>
            </View>
          </View>

          {comingSoon ? (
            <View style={styles.comingSoonBody}>
              <Text style={styles.comingSoonLead}>
                אנחנו עובדים על שיעורים חדשים לקורס הזה.
              </Text>
              <Text style={styles.comingSoonParagraph}>
                המטרה שלנו היא להרחיב את הקורס באופן מתמיד עם תוכן חדש
                ואיכותי — כדי שתמיד יהיה לכם מה ללמוד.
              </Text>
              <Text style={styles.comingSoonParagraph}>
                תודה שלמדתם עם Invixe. נשמח לראות אתכם כשהתוכן החדש יגיע.
              </Text>
              <Text style={styles.comingSoonFooter}>הישארו איתנו!</Text>
            </View>
          ) : selectedMainLesson?.sublessons ? (
            <>
              <View style={styles.progressBlock}>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressPercent}>{progressPct}%</Text>
                  <Text style={styles.progressLabel}>
                    {doneCount} מתוך {totalCount} שיעורים
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${progressPct}%` }]}
                  />
                </View>
              </View>

              <ScrollView
                style={[
                  styles.modalLessonsScrollContainer,
                  // RN Android Modal: ScrollView needs an explicit height bound or it
                  // expands to content size and never becomes scrollable.
                  Platform.OS === "android" && {
                    height: Math.max(220, MODAL_MAX_HEIGHT - 200),
                  },
                ]}
                contentContainerStyle={styles.modalLessonsScrollContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                bounces={Platform.OS === "ios"}
                overScrollMode="always"
              >
                {selectedMainLesson.sublessons.map((sublesson, idx) => {
                  const isCompleted = completedLessons.includes(sublesson.id);
                  const isCurrent =
                    !isCompleted &&
                    selectedMainLesson.sublessons!.slice(0, idx).every((l) =>
                      completedLessons.includes(l.id)
                    );
                  const isLocked = !isCompleted && !isCurrent;
                  const isFirst = idx === 0;
                  const isLast =
                    idx === selectedMainLesson.sublessons!.length - 1;
                  const prevCompleted =
                    idx > 0 &&
                    completedLessons.includes(
                      selectedMainLesson.sublessons![idx - 1].id
                    );

                  return (
                    <React.Fragment key={sublesson.id}>
                      <View style={styles.timelineRow}>
                        <View style={styles.timelineRail}>
                          <View
                            style={[
                              styles.timelineSegment,
                              !isFirst && styles.timelineSegmentVisible,
                              prevCompleted && styles.timelineLineDone,
                            ]}
                          />
                          <View
                            style={[
                              styles.statusNode,
                              isCompleted && styles.statusNodeCompleted,
                              isCurrent && styles.statusNodeCurrent,
                              isLocked && styles.statusNodeLocked,
                            ]}
                          >
                            {isCompleted ? (
                              <CheckIcon />
                            ) : isCurrent ? (
                              <PlayIcon />
                            ) : (
                              <LockIcon size={12} />
                            )}
                          </View>
                          <View
                            style={[
                              styles.timelineSegment,
                              !isLast && styles.timelineSegmentVisible,
                              isCompleted && styles.timelineLineDone,
                            ]}
                          />
                        </View>

                        <Pressable
                          onPress={() => !isLocked && onStart(sublesson.id)}
                          style={({ pressed }) => [
                            styles.modalLessonItem,
                            isCompleted && styles.modalLessonCompleted,
                            isCurrent && styles.modalLessonCurrent,
                            isLocked && styles.modalLessonLocked,
                            pressed && !isLocked && styles.modalLessonItemPressed,
                          ]}
                          disabled={isLocked}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: isLocked }}
                          accessibilityLabel={`${idx + 1}. ${sublesson.title}`}
                        >
                          <View style={styles.modalLessonTextContainer}>
                            <View style={styles.modalLessonHeader}>
                              <Text
                                style={[
                                  styles.modalLessonNumber,
                                  isCompleted && styles.modalLessonNumberCompleted,
                                  isCurrent && styles.modalLessonNumberCurrent,
                                  isLocked && styles.modalLessonNumberLocked,
                                ]}
                              >
                                {idx + 1}
                              </Text>
                              <Text
                                style={[
                                  styles.modalLessonText,
                                  isCompleted && styles.modalLessonTextCompleted,
                                  isCurrent && styles.modalLessonTextCurrent,
                                  isLocked && styles.modalLessonTextLocked,
                                ]}
                                numberOfLines={2}
                              >
                                {sublesson.title}
                              </Text>
                            </View>
                            {isCurrent ? (
                              <Text style={styles.currentHint}>
                                השיעור הבא · לחצו להתחלה
                              </Text>
                            ) : null}
                          </View>

                          {isCurrent ? (
                            <View style={styles.currentChip}>
                              <Text style={styles.currentChipText}>המשך</Text>
                            </View>
                          ) : null}
                        </Pressable>
                      </View>

                      {!isLast ? (
                        <View style={styles.interRowConnector}>
                          <View style={styles.interRowRail}>
                            <View
                              style={[
                                styles.interRowLine,
                                isCompleted && styles.timelineLineDone,
                              ]}
                            />
                          </View>
                          <View style={styles.interRowSpacer} />
                        </View>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const NODE_SIZE = 28;
const RAIL_WIDTH = 28;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface.overlay,
  },
  modalContent: {
    flexDirection: "column",
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.lg,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    width: "100%",
    maxWidth: 400,
    // Numeric maxHeight is more reliable than "%" on Android Modal layouts
    maxHeight: MODAL_MAX_HEIGHT,
    zIndex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  modalCloseButtonPressed: {
    backgroundColor: theme.colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  progressBlock: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
  },
  progressPercent: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[400],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.neutral[200],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: theme.colors.primary[400],
  },
  modalLessonsScrollContainer: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    maxHeight: Math.max(220, MODAL_MAX_HEIGHT - 200),
  },
  modalLessonsScrollContent: {
    paddingBottom: theme.spacing.md,
    // Avoid flexGrow: 1 — expands content to fill ScrollView and blocks scrolling on Android
    flexGrow: 0,
  },
  timelineRow: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    gap: theme.spacing.sm,
  },
  timelineRail: {
    width: RAIL_WIDTH,
    alignItems: "center",
    alignSelf: "stretch",
  },
  timelineSegment: {
    flex: 1,
    width: 2,
    backgroundColor: "transparent",
  },
  timelineSegmentVisible: {
    backgroundColor: theme.colors.neutral[200],
  },
  timelineLineDone: {
    backgroundColor: theme.colors.growthGreen,
    opacity: 0.4,
  },
  interRowConnector: {
    flexDirection: "row-reverse",
    height: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  interRowRail: {
    width: RAIL_WIDTH,
    alignItems: "center",
  },
  interRowLine: {
    width: 2,
    height: "100%",
    backgroundColor: theme.colors.neutral[200],
  },
  interRowSpacer: {
    flex: 1,
  },
  statusNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusNodeCompleted: {
    backgroundColor: theme.colors.growthGreen,
  },
  statusNodeCurrent: {
    backgroundColor: theme.colors.primaryBlue,
    shadowColor: theme.colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  statusNodeLocked: {
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[300],
  },
  modalLessonItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "transparent",
    gap: theme.spacing.sm,
  },
  modalLessonCompleted: {
    backgroundColor: "rgba(18, 183, 106, 0.08)",
  },
  modalLessonCurrent: {
    backgroundColor: theme.colors.trustBlueLight,
    borderWidth: 1,
    borderColor: "rgba(63, 159, 255, 0.35)",
  },
  modalLessonLocked: {
    opacity: 0.72,
  },
  modalLessonItemPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  modalLessonTextContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
  },
  modalLessonHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  modalLessonNumber: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[400],
    minWidth: 18,
    textAlign: "center",
  },
  modalLessonNumberCompleted: {
    color: theme.colors.growthGreen,
  },
  modalLessonNumberCurrent: {
    color: theme.colors.primary[500],
  },
  modalLessonNumberLocked: {
    color: theme.colors.neutral[400],
  },
  modalLessonText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    flex: 1,
  },
  modalLessonTextCompleted: {
    color: theme.colors.neutral[700],
  },
  modalLessonTextCurrent: {
    color: theme.colors.primary[500],
  },
  modalLessonTextLocked: {
    color: theme.colors.neutral[400],
    fontFamily: theme.font.family,
  },
  currentHint: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.primary[400],
    textAlign: "right",
  },
  currentChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryBlue,
  },
  currentChipText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: theme.colors.white,
  },
  comingSoonBody: {
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  comingSoonLead: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    lineHeight: 26,
    marginBottom: theme.spacing.md,
  },
  comingSoonParagraph: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    textAlign: "right",
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  comingSoonFooter: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.warning[600],
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
});
