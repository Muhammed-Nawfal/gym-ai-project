import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DialogBoxModal from "./DialogBoxModal";
import TextField from "./TextField";
import DropDownTextField from "./DropDownTextField";
import { MuscleGroup } from "../types/MuscleGroup";
import { useAuth } from "../context/AuthContext";

type Exercise = {
  id: number;
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids:number[]) => void;
  onConfirm: (payload: { ids: number[]; exercises: Exercise[] }) => void;
  exercisesOverride?: Exercise[];
};

const ChooseExercisesModal: React.FC<Props> = ({
  open,
  onClose,
  selectedIds,
  onSelectedIdsChange,
  onConfirm,
  exercisesOverride,
}) => {
  const { token } = useAuth();

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ muscleGroup: "all" });

  useEffect(() => {
    if (!open) return;

    if (exercisesOverride) {
      setAllExercises(exercisesOverride);
      return;
    }

    const fetchExercises = async () => {
      try {
        const res = await axios.get("/api/exercise", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllExercises(res.data || []);
      } catch (err) {
        console.error("Error fetching exercises:", err);
      }
    };

    fetchExercises();
  }, [open, token, exercisesOverride]);

  const muscleOptions = [
    { value: MuscleGroup.CHEST, label: "Chest" },
    { value: MuscleGroup.BACK, label: "Back" },
    { value: MuscleGroup.BICEP, label: "Bicep" },
    { value: MuscleGroup.TRICEP, label: "Tricep" },
    { value: MuscleGroup.SHOULDERS, label: "Shoulder" },
    { value: MuscleGroup.LEG, label: "Leg" },
  ];

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const mg = filters.muscleGroup;

    return (allExercises || []).filter((ex) => {
      const matchesSearch =
        !s ||
        ex.name.toLowerCase().includes(s) ||
        ex.primaryMuscleGroup.toLowerCase().includes(s) ||
        ex.secondaryMuscleGroup?.toLowerCase().includes(s) ||
        ex.tertiaryMuscleGroup?.toLowerCase().includes(s);

      const matchesMuscle =
        mg === "all" ||
        ex.primaryMuscleGroup?.includes(mg) ||
        ex.secondaryMuscleGroup?.includes(mg) ||
        ex.tertiaryMuscleGroup?.includes(mg);

      return matchesSearch && matchesMuscle;
    });
  }, [allExercises, search, filters]);

  const toggle = (exerciseId: number) => {
    onSelectedIdsChange(selectedIds.includes(exerciseId) ? selectedIds.filter((id)=> id !== exerciseId) : [...selectedIds, exerciseId]);
  };

  const selectedExercises = useMemo(() => {
    const set = new Set(selectedIds);
    return allExercises.filter((e) => set.has(e.id));
  }, [allExercises, selectedIds]);

  return (
    <DialogBoxModal open={open} onClose={onClose} title="Choose exercises" maxWidthClass="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <TextField
              label="Search"
              placeholder="Search exercises..."
              value={search}
              editable
              onChange={(e) => setSearch(e.target.value)}
              type="text"
            />
          </div>

          <DropDownTextField
            label="Muscle filter"
            value={filters.muscleGroup}
            onChange={(val) => setFilters({ muscleGroup: val })}
            options={[{ value: "all", label: "All Groups" }, ...muscleOptions]}
          />
        </div>

        <div className="max-h-[46vh] overflow-y-auto space-y-2 pr-1">
          {filtered.map((ex) => {
            const checked = selectedIds.includes(ex.id);
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggle(ex.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all
                  ${checked ? "border-brand-gold/60 bg-brand-gold/10" : "border-white/10 bg-black/30 hover:border-brand-gold/30"}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-100">{ex.name}</p>
                    <p className="muted text-sm mt-1 line-clamp-1">{ex.description}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {[ex.primaryMuscleGroup, ex.secondaryMuscleGroup, ex.tertiaryMuscleGroup]
                        .filter(Boolean)
                        .map((mg, idx) => (
                          <span
                            key={`${ex.id}-${mg}-${idx}`}
                            className="px-2.5 py-1 rounded-lg border border-brand-gold/20 bg-black/30 text-xs text-zinc-200"
                          >
                            {mg}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div
                    className={`shrink-0 mt-1 w-5 h-5 rounded border flex items-center justify-center
                      ${checked ? "border-brand-gold bg-brand-gold/20" : "border-white/20"}
                    `}
                    aria-hidden
                  >
                    {checked ? <span className="text-brand-gold text-sm">✓</span> : null}
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && <p className="muted">No exercises found.</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-danger" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onConfirm({ids: selectedIds, exercises: selectedExercises})}
          >
            Add selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </DialogBoxModal>
  );
};

export default ChooseExercisesModal;
