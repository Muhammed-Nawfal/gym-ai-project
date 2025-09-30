import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import TextField from "./TextField";
import { MuscleGroup } from "../types/MuscleGroup";
import { Label } from "@headlessui/react";
import DropDownTextField from "./DropDownTextField";

interface CreateExerciseModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({ onClose, onCreated }) => {
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        muscleGroups: [] as string[],
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

        const { name, muscleGroups, description, youtubeLink } = formData;

        if (!name || !muscleGroups) {
            setError("Enter a name and select a muscle group");
            return;
        }
        else if(!name) {
            setError("Enter a name");
            return;
        }
        else if (!(muscleGroups.length>0)){
            setError("Select a muscle group");
            return;
        }
        

        try{
            await axios.post("/api/exercise/add", formData, {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-brand-gold/10 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-brand-gold text-2xl font-semibold">Create Custom Exercise</h2>
        </div>
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
            label="Muscle Groups"
            placeholder="Select one or more"
            value={formData.muscleGroups}
            onChange={(vals) => setFormData({ ...formData, muscleGroups: vals })}
            options={muscleGroupOptions}
            multiSelect={true}
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
      </div>
    </div>
  );
};

export default CreateExerciseModal;