import React, { useState } from "react";
import TextField from "../components/TextField";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../context/RegistrationContext";
import axios from "axios";
import { Goal } from "../types/Goal";
import { SkillLevel } from "../types/SkillLevel";
import DropDownTextField from "../components/DropDownTextField";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const OnBoarding: React.FC = () => {
  const navigate = useNavigate();
  const { registrationData, updateRegistrationData, clearRegistrationData } = useRegistration();
  
  const [formData, setFormData] = useState({
        height: "",
        weight: "",
        goalWeight: "",
        userGoal: "",
        skillLevel: "",
        dob: "",
  });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const { setToken } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({...prev, [field]: value }));
    };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if(!file) return;

      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setProfilePicture(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if( !formData.height || !formData.weight || !formData.goalWeight || !formData.userGoal || !formData.skillLevel || !formData.dob ) {
            setError("All fields are required.");
            return;
        }

        try {
          setLoading(true);

          const completeRegistrationData= {
            ...registrationData,
            height: parseInt(formData.height),
            weight: parseInt(formData.weight),
            goalWeight: parseInt(formData.goalWeight),
            userGoal: formData.userGoal,
            skillLevel: formData.skillLevel,
            dob: formData.dob,
          };

          const registerResponse = await axios.post("/api/auth/register", completeRegistrationData);

          const { token } = registerResponse.data;
          setToken(token);

          if(profilePicture) {
            const formData = new FormData();
            formData.append('file', profilePicture);

            await axios.post("/api/users/me/profile-picture", formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`, 
              },
            });
          }

          clearRegistrationData();
          navigate("/home");
        }
        catch (err: any) {
          setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
        finally {
          setLoading(false);
        }
    };

    const goalOptions = [
      {value: Goal.CUTTING, label: "Cutting (Fat Loss)"},
      {value: Goal.BULKING, label: "Bulking (Muscle Gain)"},
      {value: Goal.BODY_RECOMPOSITION, label: "Body Recomposition"},
    ];

    const skillLevelOptions = [
      { value: SkillLevel.BEGINNER, label: "Beginner" },
      { value: SkillLevel.INTERMEDIATE_LIFTER, label: "Intermediate Lifter" },
      { value: SkillLevel.ADVANCED_LIFTER, label: "Advanced Lifter" },
    ];

    return(
        <div className="flex min-h-screen items-center justify-center bg-black">
            <form
                onSubmit={handleSubmit}
                className="card card-hover w-full max-w-2xl p-8 text-center space-y-4"
            >
              <div className="text-center">
                <Dumbbell className="w-12 h-12 mx-auto text-brand-gold"/>
              </div>
                <h2 className="h1 mb-2 text-brand-gold">Your Gym Journey Starts Here</h2>
                <p className="muted mb-8">Complete your profile to get personalized workout plans and track your progress effectively.</p>

                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="col-span-1 sm:col-span-2 flex justify-center mb-6">
                    <div className="relative">
                      <input
                        type="file"
                        id="profile-picture-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="profile-picture-upload"
                        className="relative block w-40 h-40 rounded-full cursor-pointer overflow-hidden border-2 border-brand-gold/30 hover:border-brand-gold transition-all group"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-zinc-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <svg
                            className="w-12 h-12 text-brand-gold mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-xs text-white font-medium">
                            {imagePreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                        </div>
                      </label>
                    </div>
                    {error && error.includes('image') && (
                      <p className="text-red-500 text-xs mt-2">{error}</p>
                    )}
                  </div>

                    <TextField
                      placeholder="Height (cm)"
                      value={formData.height}
                      onChange={(e) => handleChange("height", e.target.value)}
                      editable={true}
                      type="number"
                    />
                    <TextField
                      placeholder="Current Weight (kg)"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      editable={true}
                      type="number"
                    />

                    <TextField
                      placeholder="Date of Birth"
                      value={formData.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      editable={true}
                      type="date"
                    />
                    <TextField
                      placeholder="Your Goal Weight (kg)"
                      value={formData.goalWeight}
                      onChange={(e) => handleChange("goalWeight", e.target.value)}
                      editable={true}
                      type="number"
                    />

                </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DropDownTextField
                      placeholder="Select your fitness goal"
                      value={formData.userGoal}
                      onChange={(val) => handleChange("userGoal", val)}
                      options={goalOptions}
                      editable={true}
                    />
                    <DropDownTextField
                      placeholder="Select your skill level"
                      value={formData.skillLevel}
                      onChange={(val) => handleChange("skillLevel", val)}
                      options={skillLevelOptions}
                      editable={true}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled = {loading}
                  >
                    Create Your Profile

                  </button>
            </form>
        </div>
    );

};

export default OnBoarding;
