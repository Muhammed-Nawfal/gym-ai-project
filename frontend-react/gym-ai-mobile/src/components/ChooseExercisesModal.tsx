import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { MuscleGroup } from "../types/MuscleGroup";
import DialogBoxModal from "./DialogBoxModal";
import DropDownTextField from "./DropDownTextField";
import TextField from "./TextField";
import { appColors, blackAlpha, goldAlpha, whiteAlpha } from "../constants/appColors";

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
  onSelectedIdsChange: (ids: number[]) => void;
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

    client
      .get("/api/exercise", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAllExercises(res.data || []))
      .catch((err) => console.error("Error fetching exercises:", err));
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
    onSelectedIdsChange(
      selectedIds.includes(exerciseId)
        ? selectedIds.filter((id) => id !== exerciseId)
        : [...selectedIds, exerciseId]
    );
  };

  const selectedExercises = useMemo(() => {
    const set = new Set(selectedIds);
    return allExercises.filter((e) => set.has(e.id));
  }, [allExercises, selectedIds]);

  return (
    <DialogBoxModal open={open} onClose={onClose} title="Choose exercises">
      <View style={{ gap: 12 }}>
        <TextField label="Search" placeholder="Search exercises..." value={search} editable onChange={setSearch} />

        <DropDownTextField
          label="Muscle filter"
          value={filters.muscleGroup}
          onChange={(val) => setFilters({ muscleGroup: val })}
          options={[{ value: "all", label: "All Groups" }, ...muscleOptions]}
        />

        <View>
          {filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.option, checked && styles.optionChecked]}
                onPress={() => toggle(item.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{item.name}</Text>
                  <Text style={styles.optionDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View style={styles.badgeRow}>
                    {[item.primaryMuscleGroup, item.secondaryMuscleGroup, item.tertiaryMuscleGroup]
                      .filter(Boolean)
                      .map((mg, idx) => (
                        <View key={`${item.id}-${mg}-${idx}`} style={styles.badge}>
                          <Text style={styles.badgeText}>{mg}</Text>
                        </View>
                      ))}
                  </View>
                </View>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked ? <Text style={{ color: appColors.gold }}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 && <Text style={styles.optionDesc}>No exercises found.</Text>}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btnDanger} onPress={onClose}>
            <Text style={styles.btnDangerText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => onConfirm({ ids: selectedIds, exercises: selectedExercises })}
          >
            <Text style={styles.btnPrimaryText}>Add selected ({selectedIds.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DialogBoxModal>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: whiteAlpha(0.1),
    backgroundColor: blackAlpha(0.3),
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  optionChecked: {
    borderColor: goldAlpha(0.6),
    backgroundColor: goldAlpha(0.1),
  },
  optionTitle: {
    color: appColors.ink,
    fontWeight: "500",
  },
  optionDesc: {
    color: appColors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: goldAlpha(0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: appColors.ink,
    fontSize: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: whiteAlpha(0.2),
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: appColors.gold,
    backgroundColor: goldAlpha(0.2),
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
});

export default ChooseExercisesModal;
