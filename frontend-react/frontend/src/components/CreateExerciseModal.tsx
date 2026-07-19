import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import TextField from "./TextField";
import { MuscleGroup } from "../types/MuscleGroup";
import { Label } from "@headlessui/react";
import DropDownTextField from "./DropDownTextField";
import DialogBoxModal from "./DialogBoxModal";

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

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
        document.body.style.overflow = "auto";
        };
    }, []);

    const handleChange = (field: string, value:string)=> {
        setFormData((prev) => ({...prev, [field]:value}))
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { name, primaryMuscleGroup, secondaryMuscleGroup, tertiaryMuscleGroup, description, youtubeLink } = formData;

        if (!name || !primaryMuscleGroup) {
            setError("Enter a name and select a primary muscle group");
            return;
        }
        else if(!name) {
            setError("Enter a name");
            return;
        }
        else if (!formData.primaryMuscleGroup){
            setError("Select a primary muscle group");
            return;
        }
        

        try{
            await axios.post("/api/exercise/add", {
              ...formData,
              secondaryMuscleGroup: formData.secondaryMuscleGroup || null,
              tertiaryMuscleGroup: formData.tertiaryMuscleGroup || null,
            }, {
                headers: { Authorization: `Bearer ${token}`},
            });
            onCreated();
            onClose();
        }

        catch (err) {
            console.error("Error creating exercise:", err);
        }
    }

    const muscleGroupOptions = [
        {value: MuscleGroup.CHEST, label: "Chest"},
        {value: MuscleGroup.BACK, label: "Back"},
        {value: MuscleGroup.BICEP, label: "Bicep"},
        {value: MuscleGroup.TRICEP, label: "Tricep"},
        {value: MuscleGroup.SHOULDERS, label: "Shoulder"},
        {value: MuscleGroup.LEG, label: "Leg"},
    ];

    return (

      <DialogBoxModal
        open={true}
        onClose={onClose}
        title="Create Custom Exercise"
      >
        <p className="muted mb-10">
          Add a new exercise and contribute to the app
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="Exercise Name"
            placeholder="Eg. Single arm pushdown"
            value={formData.name}
            editable={true}
            onChange={(e) => handleChange("name", e.target.value)}
            type="text"
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
            editable={true}
            onChange={(e) => handleChange("description", e.target.value)}
            type="text"
          />

          <TextField
            label="YouTube Tutorial URL (Optional)"
            placeholder="Add a YouTube tutorial"
            value={formData.youtubeLink}
            editable
            type="url"
            onChange={(e) => handleChange("youtubeLink", e.target.value)}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-danger"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Exercise
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </DialogBoxModal>

  );
};

export default CreateExerciseModal;