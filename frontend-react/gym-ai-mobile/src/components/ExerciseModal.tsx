import { BicepsFlexed, PlayCircle } from "lucide-react-native";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DialogBoxModal from "./DialogBoxModal";

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
}

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

// The web version embedded the YouTube video directly via an <iframe>.
// RN has no iframe/webview built in (embedding one would need the extra
// react-native-webview package) - simplest equivalent here is a button that
// opens the link in the phone's YouTube app or browser instead.
const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose }) => {
  return (
    <DialogBoxModal open onClose={onClose} title={exercise.name} icon={<BicepsFlexed color="#d4af37" />}>
      {exercise.youtubeLink && (
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => Linking.openURL(exercise.youtubeLink!)}
        >
          <PlayCircle color="#d4af37" size={18} />
          <Text style={styles.videoButtonText}>Watch Tutorial</Text>
        </TouchableOpacity>
      )}

      {exercise.description && (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.muted}>{exercise.description}</Text>
        </View>
      )}

      <View style={styles.badgeRow}>
        {[exercise.primaryMuscleGroup, exercise.secondaryMuscleGroup, exercise.tertiaryMuscleGroup]
          .filter(Boolean)
          .map((muscle, idx) => (
            <View key={`${muscle}-${idx}`} style={styles.badge}>
              <Text style={styles.badgeText}>{muscle}</Text>
            </View>
          ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btnDanger} onPress={onClose}>
          <Text style={styles.btnDangerText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>+ Add to Workout</Text>
        </TouchableOpacity>
      </View>
    </DialogBoxModal>
  );
};

const styles = StyleSheet.create({
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  videoButtonText: {
    color: "#d4af37",
    fontWeight: "500",
  },
  descriptionCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  descriptionTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 6,
  },
  muted: {
    color: "#a1a1aa",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    borderWidth: 1,
    borderColor: "#8a6d1f",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#d4af37",
    fontSize: 12,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: "#d4af37",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnPrimaryText: {
    color: "#000000",
    fontWeight: "600",
  },
  btnDanger: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnDangerText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});

export default ExerciseModal;
