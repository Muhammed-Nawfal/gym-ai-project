import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { MuscleGroup } from "../types/MuscleGroup";
import DialogBoxModal from "./DialogBoxModal";
import DropDownTextField from "./DropDownTextField";
import TextField from "./TextField";
import { appColors } from "../constants/appColors";

interface CreateExerciseModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({ onClose, onCreated }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    primaryMuscleGroup: "",
    secondaryMuscleGroup: "",
    tertiaryMuscleGroup: "",
    description: "",
    youtubeLink: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { name, primaryMuscleGroup } = formData;

    if (!name) {
      setError("Enter a name");
      return;
    }
    if (!primaryMuscleGroup) {
      setError("Select a primary muscle group");
      return;
    }

    try {
      await client.post(
        "/api/exercise/add",
        {
          ...formData,
          secondaryMuscleGroup: formData.secondaryMuscleGroup || null,
          tertiaryMuscleGroup: formData.tertiaryMuscleGroup || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error creating exercise:", err);
    }
  };

  const muscleGroupOptions = [
    { value: MuscleGroup.CHEST, label: "Chest" },
    { value: MuscleGroup.BACK, label: "Back" },
    { value: MuscleGroup.BICEP, label: "Bicep" },
    { value: MuscleGroup.TRICEP, label: "Tricep" },
    { value: MuscleGroup.SHOULDERS, label: "Shoulder" },
    { value: MuscleGroup.LEG, label: "Leg" },
  ];

  return (
    <DialogBoxModal open onClose={onClose} title="Create Custom Exercise">
      <Text style={styles.muted}>Add a new exercise and contribute to the app</Text>

      <View style={{ gap: 14, marginTop: 12 }}>
        <TextField
          label="Exercise Name"
          placeholder="Eg. Single arm pushdown"
          value={formData.name}
          editable
          onChange={(v) => handleChange("name", v)}
        />

        <DropDownTextField
          label="Primary Muscle"
          value={formData.primaryMuscleGroup}
          onChange={(val) => handleChange("primaryMuscleGroup", val)}
          options={muscleGroupOptions}
        />

        <DropDownTextField
          label="Secondary Muscle (optional)"
          value={formData.secondaryMuscleGroup}
          onChange={(val) => handleChange("secondaryMuscleGroup", val)}
          options={[{ value: "", label: "None" }, ...muscleGroupOptions]}
        />

        <DropDownTextField
          label="Tertiary Muscle (optional)"
          value={formData.tertiaryMuscleGroup}
          onChange={(val) => handleChange("tertiaryMuscleGroup", val)}
          options={[{ value: "", label: "None" }, ...muscleGroupOptions]}
        />

        <TextField
          label="Description"
          placeholder="Describe the exercise's form"
          value={formData.description}
          editable
          onChange={(v) => handleChange("description", v)}
        />

        <TextField
          label="YouTube Tutorial URL (Optional)"
          placeholder="Add a YouTube tutorial"
          value={formData.youtubeLink}
          editable
          onChange={(v) => handleChange("youtubeLink", v)}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btnDanger} onPress={onClose}>
            <Text style={styles.btnDangerText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
            <Text style={styles.btnPrimaryText}>Create Exercise</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </DialogBoxModal>
  );
};

const styles = StyleSheet.create({
  muted: {
    color: appColors.muted,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
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
    marginTop: 8,
  },
});

export default CreateExerciseModal;
