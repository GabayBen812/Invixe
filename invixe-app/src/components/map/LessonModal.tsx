import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import theme from "../../theme";
import ProgressBar from "./ProgressBar";
import { InfoIcon, MemorizeIcon, PracticeIcon, TestIcon, XPStarSVG } from "./MapAssets";

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
  const renderHeaderIcon = () => {
    switch (selectedMainLesson?.lessonType) {
      case "memorize":
        return <MemorizeIcon size={24} />;
      case "practice":
        return <PracticeIcon size={24} />;
      case "test":
        return <TestIcon size={24} />;
      default:
        return <InfoIcon size={24} />;
    }
  };

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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <View style={styles.modalIconCircle}>{renderHeaderIcon()}</View>
                </View>
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>{selectedMainLesson.title}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedMainLesson.sublessons ? `${selectedMainLesson.sublessons.length} שיעורים משניים` : "שיעור יחיד"} • {selectedMainLesson.description}
                  </Text>
                </View>
                <TouchableWithoutFeedback onPress={onClose}>
                  <View style={styles.modalCloseButton}>
                    <Text style={{ color: "#64748B", fontSize: 16 }}>×</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>

              <View style={styles.modalProgress}>
                <ProgressBar progress={progress} width={280} />
              </View>

              {selectedMainLesson.sublessons ? (
                <ScrollView style={styles.modalLessonsScrollContainer} showsVerticalScrollIndicator contentContainerStyle={styles.modalLessonsScrollContent}>
                  {selectedMainLesson.sublessons.map((sublesson, idx) => {
                    const isCompleted = completedLessons.includes(sublesson.id);
                    const isCurrent = !isCompleted && selectedMainLesson.sublessons!.slice(0, idx).every((l) => completedLessons.includes(l.id));
                    const attempt = lessonAttempts.find((a) => a.lessonId === sublesson.id);
                    const attempts = attempt?.attempts || 0;
                    return (
                      <Pressable key={sublesson.id} onPress={() => onStart(sublesson.id)} style={[styles.modalLessonItem, isCompleted && styles.modalLessonCompleted, isCurrent && styles.modalLessonCurrent]}>
                        <View style={styles.modalLessonIcon}>{isCompleted ? <Text style={styles.checkmark}>✓</Text> : isCurrent ? <Text style={styles.currentDot}>●</Text> : <Text style={styles.lockedDot}>○</Text>}</View>
                        <View style={styles.modalLessonTextContainer}>
                          <Text style={[styles.modalLessonText, isCompleted && styles.modalLessonTextCompleted, isCurrent && styles.modalLessonTextCurrent]}>
                            {idx + 1}. {sublesson.title}
                          </Text>
                          <Text style={styles.modalLessonDescription}>{sublesson.description}</Text>
                          {attempts > 0 && <Text style={styles.modalLessonAttempts}>{attempts} ניסיון{attempts > 1 ? "ים" : ""}</Text>}
                        </View>
                        {isCompleted && <XPStarSVG size={16} />}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.modalLessonsList}>
                  <View style={[styles.modalLessonItem, completedLessons.includes(selectedMainLesson.id) && styles.modalLessonCompleted]}>
                    <View style={styles.modalLessonIcon}>{completedLessons.includes(selectedMainLesson.id) ? <Text style={styles.checkmark}>✓</Text> : <Text style={styles.currentDot}>●</Text>}</View>
                    <View style={styles.modalLessonTextContainer}>
                      <Text style={[styles.modalLessonText, completedLessons.includes(selectedMainLesson.id) && styles.modalLessonTextCompleted]}>{selectedMainLesson.title}</Text>
                      <Text style={styles.modalLessonDescription}>{selectedMainLesson.description}</Text>
                    </View>
                    {completedLessons.includes(selectedMainLesson.id) && <XPStarSVG size={16} />}
                  </View>
                </View>
              )}

              {selectedMainLesson.sublessons ? (
                (() => {
                  const nextSub = selectedMainLesson.sublessons!.find((l) => !completedLessons.includes(l.id));
                  if (!nextSub) {
                    return (
                      <View style={styles.modalCompletedContainer}>
                        <View style={styles.modalCompletedButton}><Text style={styles.modalCompletedText}>🎉 שיעור הושלם!</Text></View>
                        <Text style={styles.modalCompletedSubtext}>תוכל לחזור על כל שיעור משני מתי שתרצה</Text>
                        <Pressable style={styles.modalRetakeButton} onPress={() => onStart(selectedMainLesson.sublessons![0].id)}><Text style={styles.modalRetakeText}>חזור על שיעור ראשון</Text></Pressable>
                      </View>
                    );
                  }
                  const subIndex = selectedMainLesson.sublessons!.findIndex((l) => l.id === nextSub.id);
                  return (
                    <Pressable style={styles.modalActionButton} onPress={() => onStart(nextSub.id)}>
                      <Text style={styles.modalActionText}>התחל שיעור {subIndex + 1}</Text>
                    </Pressable>
                  );
                })()
              ) : completedLessons.includes(selectedMainLesson.id) ? (
                <View style={styles.modalCompletedContainer}>
                  <View style={styles.modalCompletedButton}><Text style={styles.modalCompletedText}>🎉 שיעור הושלם!</Text></View>
                  <Text style={styles.modalCompletedSubtext}>תוכל לחזור על השיעור מתי שתרצה</Text>
                  <Pressable style={styles.modalRetakeButton} onPress={() => onStart(selectedMainLesson.id)}><Text style={styles.modalRetakeText}>חזור על השיעור</Text></Pressable>
                </View>
              ) : (
                <Pressable style={styles.modalActionButton} onPress={() => onStart(selectedMainLesson.id)}>
                  <Text style={styles.modalActionText}>התחל שיעור</Text>
                </Pressable>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconContainer: { marginRight: 16 },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  modalHeaderText: { flex: 1, alignItems: "flex-start" },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "left",
    letterSpacing: -0.3,
  },
  modalSubtitle: { fontSize: 14, fontFamily: theme.font.family, color: "#64748B", textAlign: "left" },
  modalProgress: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#F1F5F9" },
  modalLessonsList: { marginBottom: 24 },
  modalLessonsScrollContainer: { maxHeight: 280, marginBottom: 24 },
  modalLessonsScrollContent: { paddingBottom: 8 },
  modalLessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: "#FAFBFF",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalLessonCompleted: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  modalLessonCurrent: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  modalLessonIcon: { width: 24, height: 24, alignItems: "center", justifyContent: "center", marginRight: 12 },
  checkmark: { fontSize: 16, color: "#059669", fontWeight: "bold" },
  currentDot: { fontSize: 16, color: "#0EA5E9" },
  lockedDot: { fontSize: 16, color: "#94A3B8" },
  modalLessonTextContainer: { flex: 1, flexDirection: "column" },
  modalLessonText: { fontSize: 15, fontFamily: theme.font.family, color: "#334155", textAlign: "right", lineHeight: 20 },
  modalLessonDescription: { fontSize: 11, fontFamily: theme.font.family, color: "#64748B", textAlign: "right", marginTop: 1, lineHeight: 14 },
  modalLessonAttempts: { fontSize: 12, fontFamily: theme.font.family, color: "#64748B", textAlign: "right", marginTop: 2 },
  modalLessonTextCompleted: { color: "#059669", fontFamily: theme.font.bold },
  modalLessonTextCurrent: { color: "#0EA5E9", fontFamily: theme.font.bold },
  modalActionButton: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, alignItems: "center", shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  modalActionText: { fontSize: 17, fontFamily: theme.font.bold, color: "#FFFFFF", letterSpacing: 0.3 },
  modalCompletedContainer: { alignItems: "center" },
  modalCompletedButton: { backgroundColor: "#F59E0B", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, alignItems: "center", marginBottom: 12 },
  modalCompletedText: { fontSize: 17, fontFamily: theme.font.bold, color: "#FFFFFF", letterSpacing: 0.3 },
  modalCompletedSubtext: { fontSize: 14, fontFamily: theme.font.family, color: "#64748B", textAlign: "center", marginBottom: 16 },
  modalRetakeButton: { backgroundColor: "#E2E8F0", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1" },
  modalRetakeText: { fontSize: 15, fontFamily: theme.font.bold, color: "#475569" },
});


