import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { MuscleGroup } from "../types/MuscleGroup";
import ChooseExercisesModal from "./ChooseExercisesModal";
import DialogBoxModal from "./DialogBoxModal";
import DropDownTextField from "./DropDownTextField";
import TextField from "./TextField";
import { appColors, whiteAlpha } from "../constants/appColors";

type Exercise = {
  id: number;
  name: string;
  description?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
};

interface Props {
  mode?: "create" | "edit";
  workoutId?: number;
  onClose: () => void;
  onSaved: () => void;
}

type CreateWorkoutForm = {
  name: string;
  description: string;
  muscleGroups: string[];
};

const CreateWorkoutModal: React.FC<Props> = ({ mode, workoutId, onClose, onSaved }) => {
  const { token, user } = useAuth();
  const userId = user?.id;

  const [formData, setFormData] = useState<CreateWorkoutForm>({
    name: "",
    description: "",
    muscleGroups: [],
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [chooseOpen, setChooseOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = <K extends keyof CreateWorkoutForm>(field: K, value: CreateWorkoutForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isEdit = mode === "edit";

  const muscleOptions = [
    { value: MuscleGroup.CHEST, label: "Chest" },
    { value: MuscleGroup.BACK, label: "Back" },
    { value: MuscleGroup.BICEP, label: "Bicep" },
    { value: MuscleGroup.TRICEP, label: "Tricep" },
    { value: MuscleGroup.SHOULDERS, label: "Shoulder" },
    { value: MuscleGroup.LEG, label: "Leg" },
  ];

  useEffect(() => {
    if (mode !== "edit" || !workoutId) return;

    client
      .get(`/api/workout/${workoutId}/details`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const w = res.data;

        setFormData({
          name: w.name ?? "",
          description: w.description ?? "",
          muscleGroups: w.muscleGroups ?? [],
        });

        setSelectedExercises(
          (w.exercises ?? []).map((e: any) => ({
            id: e.exerciseId ?? e.id,
            name: e.exerciseName ?? e.name,
            description: e.description,
            primaryMuscleGroup: e.primaryMuscleGroup,
            secondaryMuscleGroup: e.secondaryMuscleGroup,
            tertiaryMuscleGroup: e.tertiaryMuscleGroup,
          }))
        );

        setSelectedIds((w.exercises ?? []).map((e: any) => e.exerciseId ?? e.id));
      })
      .catch((err) => {
        console.error("Failed to load workout for edit", err);
        setError("Failed to load workout for editing.");
      });
  }, [mode, workoutId, token]);

  const handleSubmit = async () => {
    setError("");

    if (!userId) {
      setError("You must be logged in.");
      return;
    }
    if (!formData.name.trim()) {
      setError("Enter a workout name");
      return;
    }
    if (formData.muscleGroups.length === 0) {
      setError("Select at least one muscle group.");
      return;
    }
    if (selectedExercises.length === 0) {
      setError("Please add at least 1 exercise to the workout.");
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        if (!workoutId) throw new Error("Missing workoutId for edit");

        await client.put(
          `/api/workout/${workoutId}`,
          {
            name: formData.name,
            description: formData.description,
            muscleGroups: formData.muscleGroups,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await client.put(
          `/api/workouts/${workoutId}/exercises/sync`,
          { exerciseIds: selectedExercises.map((e) => e.id) },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        onSaved();
        onClose();
        return;
      }

      const res = await client.post(
        "/api/workout/create",
        {
          user: { id: userId },
          name: formData.name,
          description: formData.description,
          muscleGroups: formData.muscleGroups,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdWorkoutId = res.data?.id;
      if (!createdWorkoutId) throw new Error("Workout created but no id returned.");

      await client.put(
        `/api/workouts/${createdWorkoutId}/exercises/sync`,
        { exerciseIds: selectedExercises.map((e) => e.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error creating/editing workout:", err);
      setError("Failed. Check console + backend logs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogBoxModal open onClose={onClose} title={isEdit ? "Edit Workout Plan" : "Create Custom Workout Plan"}>
        <Text style={styles.muted}>
          {isEdit ? "Update your workout and manage exercises." : "Build your own workout and choose exercises."}
        </Text>

        <View style={{ gap: 14, marginTop: 12 }}>
          <TextField
            label="Workout Name"
            placeholder="Eg. Push Day A"
            value={formData.name}
            editable
            onChange={(v) => handleChange("name", v)}
          />
          <TextField
            label="Description (optional)"
            placeholder="Eg. Chest/shoulders/triceps focus"
            value={formData.description}
            editable
            onChange={(v) => handleChange("description", v)}
          />
          <DropDownTextField
            label="Muscle Groups"
            placeholder="Select muscle groups"
            value={formData.muscleGroups}
            onChange={(vals) => handleChange("muscleGroups", vals)}
            options={muscleOptions}
            multiSelect
          />

          <View style={{ gap: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.subLabel}>Choose Your Exercises</Text>
              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setChooseOpen(true)}>
                <Plus color={appColors.black} size={14} />
                <Text style={styles.addExerciseButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {selectedExercises.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.muted}>No exercises selected yet.</Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                {selectedExercises.map((ex) => (
                  <View key={ex.id} style={styles.exerciseRow}>
                    <View>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseMuscle}>{ex.primaryMuscleGroup}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedExercises((prev) => prev.filter((e) => e.id !== ex.id));
                        setSelectedIds((prev) => prev.filter((id) => id !== ex.id));
                      }}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnDanger} onPress={onClose} disabled={saving}>
              <Text style={styles.btnDangerText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={saving}>
              <Text style={styles.btnPrimaryText}>
                {saving ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save Changes" : "Create Workout"}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </DialogBoxModal>

      {chooseOpen && (
        <ChooseExercisesModal
          open={chooseOpen}
          onClose={() => setChooseOpen(false)}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onConfirm={({ ids, exercises }) => {
            setSelectedIds(ids);
            setSelectedExercises(exercises);
            setChooseOpen(false);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  muted: {
    color: appColors.muted,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subLabel: {
    color: appColors.ink,
    fontSize: 15,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addExerciseButtonText: {
    color: appColors.black,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: whiteAlpha(0.03),
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: whiteAlpha(0.1),
    paddingBottom: 8,
  },
  exerciseName: {
    color: "#f4f4f5",
    fontWeight: "500",
  },
  exerciseMuscle: {
    color: appColors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  removeText: {
    color: "#f87171",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnPrimaryText: {
    color: appColors.black,
    fontWeight: "600",
  },
  btnDanger: {
    borderWidth: 1,
    borderColor: appColors.danger,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnDangerText: {
    color: appColors.danger,
    fontWeight: "600",
  },
  error: {
    color: appColors.danger,
  },
});

export default CreateWorkoutModal;
