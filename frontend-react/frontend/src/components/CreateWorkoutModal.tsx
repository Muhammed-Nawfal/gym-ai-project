import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DialogBoxModal from "./DialogBoxModal";
import TextField from "./TextField";
import DropDownTextField from "./DropDownTextField";
import ChooseExercisesModal from "./ChooseExercisesModal";
import { MuscleGroup } from "../types/MuscleGroup";
import { Plus } from "lucide-react";

type Exercise = {
    id: number;
    name: string;
    description?: string;
    primaryMuscleGroup: string;
    secondaryMuscleGroup?: string;
    tertiaryMuscleGroup?: string;
};

interface Props {
  mode? : "create" | "edit";
  workoutId? : number;
  initial?: {
    name: string;
    description: string;
    muscleGroups: string[];
    exercises: Exercise[];
  };
  onClose: () => void;
  onSaved: () => void;
}

type CreateWorkoutForm = {
  name: string;
  description: string;
  muscleGroups: string[];
};

const CreateWorkoutModal: React.FC<Props> = ({ mode, workoutId, initial, onClose, onSaved }) => {
  const { token, user } = useAuth();
  const userId = user?.id;

  const [formData, setFormData] = useState<CreateWorkoutForm>({
    name: initial?.name ?? "",
    description:initial?.description ?? "",
    muscleGroups: initial?.muscleGroups ?? [],
  });

  const [selectedIds, setSelectedIds] = useState<number[]>(initial?.exercises?.map((e) => e.id) ?? []);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(initial?.exercises ?? []);
  const [chooseOpen, setChooseOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = <K extends keyof CreateWorkoutForm>(field: K,value: CreateWorkoutForm[K]) => {
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

    const fetchWorkoutForEdit = async () => {
      try {
        const res = await axios.get(`/api/workout/${workoutId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

        setSelectedIds(
          (w.exercises ?? []).map((e: any) => e.exerciseId ?? e.id)
        );
      } catch (err) {
        console.error("Failed to load workout for edit", err);
        setError("Failed to load workout for editing.");
      }
    };

    fetchWorkoutForEdit();
  }, [mode, workoutId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (isEdit) {
      if (!workoutId) throw new Error("Missing workoutId for edit");

        setSaving(true);

        await axios.put(
          `/api/workout/${workoutId}`,
          {
            name: formData.name,
            description: formData.description,
            muscleGroups: formData.muscleGroups,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          `/api/workouts/${workoutId}/exercises/sync`,
          {
            exerciseIds: selectedExercises.map((e) => e.id),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );     

      onSaved();
      onClose();
      return;
    }

    try {
      setSaving(true);

      const res = await axios.post(
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

      await axios.put(
      `/api/workouts/${createdWorkoutId}/exercises/sync`,
      {
        exerciseIds: selectedExercises.map((e) => e.id),
      },
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
      <DialogBoxModal open={true} onClose={onClose} title={isEdit ? "Edit Workout Plan" : "Create Custom Workout Plan"}>
        <p className="muted mb-6">
          {isEdit
            ? "Update your workout and manage exercises."
            : "Build your own workout and choose exercises."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="Workout Name"
            placeholder="Eg. Push Day A"
            value={formData.name}
            editable
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <TextField
            label="Description (optional)"
            placeholder="Eg. Chest/shoulders/triceps focus"
            value={formData.description}
            editable
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <DropDownTextField
            label="Muscle Groups"
            placeholder="Select muscle groups"
            value={formData.muscleGroups}
            onChange={(vals) => handleChange("muscleGroups", vals)}
            options={muscleOptions}
            multiSelect={true}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="ml-1 text-l text-gray-200">Choose Your Exercises</p>

              <button
                type="button"
                className="btn btn-primary flex items-center gap-1 text-sm px-2"
                onClick={() => setChooseOpen(true)}
              >
                <Plus size={16} />
                Add Exercises
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="card-surface p-4">
                <p className="muted">No exercises selected yet.</p>
              </div>
            ) : (
              <div className="card-surface p-4 space-y-2">
                {selectedExercises.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between gap-3 border-b border-white/10 mb-3">
                    <div>
                      <p className="text-zinc-100 font-medium mb-1">
                        {ex.name}
                      </p>
                      
                      <p className="muted text-xs mb-2">
                        {ex.primaryMuscleGroup}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-sm text-red-400 hover:text-red-300"
                      onClick={() => {
                        setSelectedExercises((prev) => prev.filter((e) => e.id !== ex.id));
                        setSelectedIds((prev) => prev.filter((id) => id !== ex.id));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-danger" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (isEdit ? "Saving" : "Creating...") : (isEdit ? "Save Changes" : "Create Workout")}
            </button>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </DialogBoxModal>

      {/* Nested chooser modal */}
      {chooseOpen && (
        <ChooseExercisesModal
          open={chooseOpen}
          onClose={() => setChooseOpen(false)}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onConfirm={({ids, exercises}) => {
            setSelectedIds(ids);
            setSelectedExercises(exercises);
            setChooseOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CreateWorkoutModal;
