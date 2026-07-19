import { Dumbbell, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { WorkoutDetail, WorkoutExercise } from "../api/types";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import DialogBoxModal from "./DialogBoxModal";

type WorkoutDetailModalProps = {
  workoutId: number;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (workoutId: number) => void;
  onAddToRoutine: (workoutId: number) => void;
  onEditWorkout?: (workoutId: number) => void;
  onDelete: () => void;
  isPredefined: boolean;
};

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workoutId,
  isOpen,
  onClose,
  onStartWorkout,
  onAddToRoutine,
  isPredefined,
  onEditWorkout,
  onDelete,
}) => {
  const { token, user } = useAuth();
  const [workoutDetail, setWorkoutDetail] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !workoutId) return;

    setLoading(true);

    client
      .get(`/api/workout/${workoutId}/details`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setWorkoutDetail(res.data))
      .catch(() => setError("Failed to load workout details"))
      .finally(() => setLoading(false));
  }, [isOpen, workoutId, token]);

  if (!isOpen) return null;

  const canEdit = !!workoutDetail && workoutDetail.isPredefined === false && workoutDetail.userId === user?.id;

  const handleDeleteWorkout = async () => {
    setError(null);

    if (!canEdit) {
      setError("You can only delete your own workouts.");
      return;
    }

    try {
      await client.delete(`/api/workout/${workoutId}`, { headers: { Authorization: `Bearer ${token}` } });
      onClose();
      onDelete();
    } catch {
      setError("Failed");
    }
  };

  return (
    <DialogBoxModal
      open={isOpen}
      onClose={onClose}
      title={workoutDetail ? workoutDetail.name : "Workout Details"}
      icon={<Dumbbell color="#d4af37" />}
      headerActions={
        canEdit ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteWorkout}>
            <Trash2 color="#ef4444" size={16} />
          </TouchableOpacity>
        ) : undefined
      }
    >
      {loading && <Text style={styles.muted}>Loading exercises...</Text>}

      {workoutDetail?.description && <Text style={[styles.muted, { marginBottom: 12 }]}>{workoutDetail.description}</Text>}

      {workoutDetail && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{workoutDetail.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {workoutDetail.exercises.reduce((sum, ex) => sum + (ex.targetSets ?? 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
        </View>
      )}

      {workoutDetail && (
        <View style={{ marginTop: 16, gap: 12 }}>
          <Text style={styles.sectionLabel}>Exercise Details</Text>

          {workoutDetail.exercises.map((ex: WorkoutExercise) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeaderRow}>
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                {ex.primaryMuscleGroup ? (
                  <View style={styles.muscleBadge}>
                    <Text style={styles.muscleBadgeText}>{String(ex.primaryMuscleGroup)}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.exerciseStatsRow}>
                <View style={styles.exerciseStatBox}>
                  <Text style={styles.exerciseStatLabel}>Sets</Text>
                  <Text style={styles.exerciseStatValue}>{ex.targetSets ?? "-"}</Text>
                </View>
                <View style={styles.exerciseStatBox}>
                  <Text style={styles.exerciseStatLabel}>Reps</Text>
                  <Text style={styles.exerciseStatValue}>{ex.targetReps ?? "-"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        {isPredefined && (
          <TouchableOpacity style={styles.btnPrimary} onPress={() => onAddToRoutine(workoutId)}>
            <Text style={styles.btnPrimaryText}>Add to My Workouts</Text>
          </TouchableOpacity>
        )}

        {!isPredefined && (
          <TouchableOpacity style={styles.btnPrimary} onPress={() => onStartWorkout(workoutId)}>
            <Text style={styles.btnPrimaryText}>Start Workout</Text>
          </TouchableOpacity>
        )}

        {canEdit && onEditWorkout && (
          <TouchableOpacity style={styles.btnSecondary} onPress={() => onEditWorkout(workoutId)}>
            <Text style={styles.btnSecondaryText}>Edit Workout</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btnDanger} onPress={onClose}>
          <Text style={styles.btnDangerText}>Close</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </DialogBoxModal>
  );
};

const styles = StyleSheet.create({
  muted: {
    color: "#a1a1aa",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  sectionLabel: {
    color: "#a1a1aa",
    fontSize: 15,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 14,
    padding: 16,
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  muscleBadge: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  muscleBadgeText: {
    color: "#d4af37",
    fontSize: 11,
    fontWeight: "500",
  },
  exerciseStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  exerciseStatBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 8,
    padding: 10,
  },
  exerciseStatLabel: {
    color: "#a1a1aa",
    fontSize: 11,
  },
  exerciseStatValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
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
  btnSecondary: {
    borderWidth: 1,
    borderColor: "#a1a1aa",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnSecondaryText: {
    color: "#e4e4e7",
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
  error: {
    color: "#ef4444",
    marginTop: 12,
  },
});

export default WorkoutDetailModal;
