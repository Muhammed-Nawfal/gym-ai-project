import { BicepsFlexed } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import DialogBoxModal from "./DialogBoxModal";

const VIDEO_WIDTH = Dimensions.get("window").width - 64;
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

const getYoutubeVideoId = (url: string): string | null => {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
};

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
}

interface Workout {
  id: number;
  name: string;
  isPredefined: boolean;
}

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose }) => {
  const videoId = exercise.youtubeLink ? getYoutubeVideoId(exercise.youtubeLink) : null;
  const { token, user } = useAuth();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerError(null);
    setLoadingWorkouts(true);
    try {
      const res = await client.get(`/api/workout/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts((res.data || []).filter((w: Workout) => !w.isPredefined));
    } catch {
      setPickerError("Failed to load your workouts.");
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleAddToWorkout = async (workoutId: number) => {
    setAddingId(workoutId);
    setPickerError(null);
    try {
      await client.post(
        `/api/workouts/${workoutId}/exercises`,
        { exerciseId: exercise.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPickerOpen(false);
    } catch (err: any) {
      setPickerError(err.response?.data?.error || "Could not add exercise. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <DialogBoxModal open onClose={onClose} title={exercise.name} icon={<BicepsFlexed color="#d4af37" />}>
      {videoId && (
        <View style={styles.videoWrapper}>
          <YoutubePlayer height={VIDEO_HEIGHT} width={VIDEO_WIDTH} videoId={videoId} />
        </View>
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
        <TouchableOpacity style={styles.btnPrimary} onPress={openPicker}>
          <Text style={styles.btnPrimaryText}>+ Add to Workout</Text>
        </TouchableOpacity>
      </View>

      {pickerOpen && (
        <DialogBoxModal open onClose={() => setPickerOpen(false)} title="Add to which workout?">
          {loadingWorkouts ? (
            <ActivityIndicator color="#d4af37" style={{ marginVertical: 20 }} />
          ) : (
            <View>
              {workouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.workoutOption}
                  disabled={addingId !== null}
                  onPress={() => handleAddToWorkout(w.id)}
                >
                  <Text style={styles.workoutOptionText}>{w.name}</Text>
                  {addingId === w.id && <ActivityIndicator color="#d4af37" size="small" />}
                </TouchableOpacity>
              ))}
              {workouts.length === 0 && <Text style={styles.muted}>You don't have any workouts yet.</Text>}
              {pickerError && <Text style={styles.errorText}>{pickerError}</Text>}
            </View>
          )}
        </DialogBoxModal>
      )}
    </DialogBoxModal>
  );
};

const styles = StyleSheet.create({
  videoWrapper: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
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
  workoutOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  workoutOptionText: {
    color: "#e4e4e7",
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    marginTop: 8,
  },
});

export default ExerciseModal;
