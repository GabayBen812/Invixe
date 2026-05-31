import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import theme from "../../theme";
import { XPStarSVG } from "./MapAssets";

type Lesson = {
  id: number;
  title: string;
  description?: string;
  lessonType?: "info" | "memorize" | "practice" | "test";
  sublessons?: Lesson[];
};

type LessonAttempt = { lessonId: number; attempts: number; lastAttempted: Date | string; completed?: boolean };

type LessonModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedMainLesson: Lesson | null;
  completedLessons: number[];
  lessonAttempts: LessonAttempt[];
  onStart: (lessonId: number) => void;
};

export default function LessonModal({ visible, onClose, selectedMainLesson, completedLessons, lessonAttempts, onStart }: LessonModalProps) {
  const progress = React.useMemo(() => {
    if (!selectedMainLesson) return 0;
    if (!selectedMainLesson.sublessons) {
      return completedLessons.includes(selectedMainLesson.id) ? 1 : 0;
    }
    const total = selectedMainLesson.sublessons.length;
    const done = selectedMainLesson.sublessons.filter((l) => completedLessons.includes(l.id)).length;
    return total > 0 ? done / total : 0;
  }, [selectedMainLesson, completedLessons]);

  if (!selectedMainLesson) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="סגור" />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>{selectedMainLesson.title}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.modalCloseButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="סגור"
            >
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
          </View>

          {selectedMainLesson.sublessons ? (
            <ScrollView
              style={styles.modalLessonsScrollContainer}
              contentContainerStyle={styles.modalLessonsScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              bounces
            >
                  {selectedMainLesson.sublessons.map((sublesson, idx) => {
                    const isCompleted = completedLessons.includes(sublesson.id);
                    const isCurrent = !isCompleted && selectedMainLesson.sublessons!.slice(0, idx).every((l) => completedLessons.includes(l.id));
                    const isLocked = !isCompleted && !isCurrent;
                    const attempt = lessonAttempts.find((a) => a.lessonId === sublesson.id);
                    const attempts = attempt?.attempts || 0;
                    return (
                      <Pressable 
                        key={sublesson.id} 
                        onPress={() => !isLocked && onStart(sublesson.id)} 
                        style={({ pressed }) => [
                          styles.modalLessonItem, 
                          isCompleted && styles.modalLessonCompleted, 
                          isCurrent && styles.modalLessonCurrent,
                          isLocked && styles.modalLessonLocked,
                          pressed && styles.modalLessonItemPressed
                        ]}
                        disabled={isLocked}
                      >
                        <View style={[
                          styles.modalLessonIconContainer,
                          isCompleted && styles.modalLessonIconCompleted,
                          isCurrent && styles.modalLessonIconCurrent,
                          isLocked && styles.modalLessonIconLocked
                        ]}>
                          {isCompleted ? (
                            <Text style={styles.checkmark}>✓</Text>
                          ) : isCurrent ? (
                            <View style={styles.currentDotContainer}>
                              <View style={styles.currentDotInner} />
                            </View>
                          ) : (
                            <Text style={styles.lockedDot}>○</Text>
                          )}
                        </View>
                        <View style={styles.modalLessonTextContainer}>
                          <View style={styles.modalLessonHeader}>
                            <Text style={[
                              styles.modalLessonNumber,
                              isCompleted && styles.modalLessonNumberCompleted,
                              isCurrent && styles.modalLessonNumberCurrent,
                              isLocked && styles.modalLessonNumberLocked
                            ]}>
                              {idx + 1}
                            </Text>
                            <Text style={[
                              styles.modalLessonText, 
                              isCompleted && styles.modalLessonTextCompleted, 
                              isCurrent && styles.modalLessonTextCurrent,
                              isLocked && styles.modalLessonTextLocked
                            ]}>
                              {sublesson.title}
                            </Text>
                          </View>
                        </View>
                        {isCompleted && (
                          <View style={styles.modalLessonBadge}>
                            <XPStarSVG size={18} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
  },
  modalContent: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    zIndex: 1,
    overflow: "hidden",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  modalHeaderText: { 
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButtonText: {
    color: "#64748B",
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  modalLessonsScrollContainer: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  modalLessonsScrollContent: {
    paddingBottom: theme.spacing.md,
    flexGrow: 1,
  },
  modalLessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalLessonCompleted: { 
    backgroundColor: theme.colors.growthGreenLight, 
    borderColor: theme.colors.growthGreen,
    shadowOpacity: 0.08,
  },
  modalLessonCurrent: { 
    backgroundColor: theme.colors.trustBlueLight, 
    borderColor: theme.colors.primaryBlue,
    shadowOpacity: 0.1,
    shadowColor: theme.colors.primaryBlue,
  },
  modalLessonLocked: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.7,
  },
  modalLessonItemPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modalLessonIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalLessonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalLessonIconCompleted: {
    backgroundColor: theme.colors.growthGreenLight,
    borderColor: theme.colors.growthGreen,
  },
  modalLessonIconCurrent: {
    backgroundColor: theme.colors.trustBlueLight,
    borderColor: theme.colors.primaryBlue,
  },
  modalLessonIconLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    opacity: 0.6,
  },
  checkmark: { 
    fontSize: 18, 
    color: theme.colors.growthGreen, 
    fontFamily: theme.font.bold,
  },
  currentDotContainer: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  currentDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
  },
  lockedDot: { 
    fontSize: 20, 
    color: "#94A3B8",
  },
  modalLessonTextContainer: { 
    flex: 1, 
    flexDirection: "column",
  },
  modalLessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  modalLessonNumber: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#94A3B8",
    marginLeft: theme.spacing.sm,
    minWidth: 24,
  },
  modalLessonNumberCompleted: {
    color: theme.colors.growthGreen,
  },
  modalLessonNumberCurrent: {
    color: theme.colors.primaryBlue,
  },
  modalLessonNumberLocked: {
    color: "#94A3B8",
  },
  modalLessonText: { 
    fontSize: 16, 
    fontFamily: theme.font.bold, 
    color: theme.colors.text, 
    textAlign: "right", 
    flex: 1,
  },
  modalLessonTextCompleted: { 
    color: theme.colors.growthGreenDark, 
    fontFamily: theme.font.bold,
  },
  modalLessonTextCurrent: { 
    color: theme.colors.primaryBlue, 
    fontFamily: theme.font.bold,
  },
  modalLessonTextLocked: {
    color: "#94A3B8",
  },
  modalLessonBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionButton: { 
    backgroundColor: theme.colors.primaryBlue, 
    borderRadius: theme.radius.md, 
    paddingVertical: theme.spacing.md, 
    paddingHorizontal: theme.spacing.lg, 
    alignItems: "center", 
    shadowColor: theme.colors.primaryBlue, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 6,
  },
  modalActionText: { 
    fontSize: 17, 
    fontFamily: theme.font.bold, 
    color: theme.colors.white, 
    letterSpacing: 0.3,
  },
  modalCompletedContainer: { 
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  modalCompletedButton: { 
    backgroundColor: theme.colors.optimismOrange, 
    borderRadius: theme.radius.md, 
    paddingVertical: theme.spacing.md, 
    paddingHorizontal: theme.spacing.lg, 
    alignItems: "center", 
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.optimismOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCompletedText: { 
    fontSize: 17, 
    fontFamily: theme.font.bold, 
    color: theme.colors.white, 
    letterSpacing: 0.3,
  },
  modalCompletedSubtext: { 
    fontSize: 14, 
    fontFamily: theme.font.family, 
    color: "#64748B", 
    textAlign: "center", 
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  modalRetakeButton: { 
    backgroundColor: "#F8FAFC", 
    borderRadius: theme.radius.md, 
    paddingVertical: theme.spacing.sm, 
    paddingHorizontal: theme.spacing.md, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#E2E8F0",
  },
  modalRetakeText: { 
    fontSize: 15, 
    fontFamily: theme.font.bold, 
    color: "#475569",
  },
});


