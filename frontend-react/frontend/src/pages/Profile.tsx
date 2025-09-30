import { Calendar, Edit2, Save, UserIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import TextField from "../components/TextField";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DropDownTextField from "../components/DropDownTextField";
import { Goal } from "../types/Goal";
import { SkillLevel } from "../types/SkillLevel";


const Profile: React.FC = () => {

    const [user, setUser] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    //   copy of the user object into formData.
    const [formData, setFormData] = useState<any>(null);

    const { token } = useAuth();

    useEffect(() => {
        axios
            .get(
                "/api/users/me", 
                {headers: { Authorization: `Bearer ${token}` }}
            )
            .then(
                res => {
                    setUser(res.data);
                    setFormData(res.data);
                }
            )
            .catch(err => {
                console.error("Failed to fetch profile:", err);
            });

    }, []);
    

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const res = 
                await axios.put(
                    "/api/users/me",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUser(res.data);
                setFormData(res.data);
                setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            console.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            console.error("Image must be less than 5MB");
            return;
        }

        setProfilePicture(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleProfilePictureUpload = async () => {
        if (!profilePicture) return;

        const formData = new FormData();
        formData.append('file', profilePicture);

        try {
            await axios.post("/api/users/me/profile-picture", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
            });

            // Refresh user data to get new profile picture URL
            const res = await axios.get("/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setFormData(res.data);
            setProfilePicture(null);
            setImagePreview("");
        } catch (err) {
            console.error("Failed to upload profile picture:", err);
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    }

    if (!user) {
        return <div>Loading...</div>;
    }

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
        <main className="mx-auto max-w-7xl px-6 py-8">

            <section>
                <h1 className="h1">Your Profile</h1>
                <p className="muted mt1">Manage your personal information and fitness goals</p>
            </section>

            {/* profile section */}
            <section className="mt-8 grid gap-6 lg:grid-cols-12">

                {/* Left card which spans 4 out of 12 columns */}
                <div className="lg:col-span-4">

                    <div className="card p-6 flex flex-col items-center text-center card-hover">

                         <div className="relative mb-4">
                            <input
                            type="file"
                            id="profile-pic-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            />
                            
                            <label
                            htmlFor="profile-pic-upload"
                            className="relative block w-40 h-40 rounded-full cursor-pointer overflow-hidden border-2 border-brand-gold/30 hover:border-brand-gold transition-all group"
                            >
                            {/* Display image preview or existing profile picture or initials */}
                            {imagePreview ? (
                                <img 
                                src={imagePreview} 
                                alt="Preview"
                                className="w-full h-full object-cover"
                                />
                            ) : user.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-gold/40 text-grey-600 text-2xl font-semibold">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <svg
                                className="w-6 h-6 text-brand-gold"
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
                                <span className="text-xs text-white mt-1">Change</span>
                            </div>
                            </label>
                        </div>

                        {profilePicture && (
                            <button
                            onClick={handleProfilePictureUpload}
                            className="btn btn-primary text-xs px-3 py-1 mb-4"
                            >
                            Upload Photo
                            </button>
                        )}

                        <div className="text-xl font-medium">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="muted">
                            {user.userName}
                        </div>

                        <div className="mt-4">
                            <span className="px-3 py-2 rounded text-xs font-semibold bg-brand-gold/20 text-brand-gold">
                                {user.skillLevel}
                            </span>
                        </div>

                        <div className="flex justify-center gap-2 muted mt-5 text-sm">
                            <Calendar size={16}  />
                            <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className = "lg:col-span-8">
                    <div className="card p-6 card-hover">

                        <div className="flex justify-between items-center mb-6">
                            <div className="h2 flex items-center gap-2">
                                <UserIcon size={18} className="text-brand-gold"/>
                                Personal Information
                            </div>
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary flex items-center gap-2 px-3 py-1 text-sm "
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                            ) : 
                            (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary flex items-center gap-2 px-3 py-1 text-sm "
                                    >
                                        <Save size={14} />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="btn btn-danger flex items-center gap-2 px-3 py-1 text-sm border"
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextField 
                                label="First Name" 
                                value={formData.firstName} 
                                editable={isEditing} 
                                onChange={(e) => handleChange("firstName", e.target.value)}
                            />
                            <TextField 
                                label="Last Name" 
                                value={formData.lastName} 
                                editable={isEditing} 
                                onChange={(e) => handleChange("lastName", e.target.value)}
                            />
                            <TextField
                                label="Username" 
                                value={formData.userName} 
                                editable={isEditing}
                                onChange={(e) => handleChange("userName", e.target.value)}
                            />
                            <TextField 
                                label="Email" 
                                value={formData.email} 
                                editable={isEditing} 
                                type="email"
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                           
                            <div className="sm:col-span-2">
                                <TextField 
                                    label="Date of Birth" 
                                    value={formData.dob} 
                                    editable={isEditing} 
                                    type="date"
                                    onChange={(e) => handleChange("dob", e.target.value)}
                                />
                            </div>
                            <TextField 
                                label="Height (cm)" 
                                value={formData.height} 
                                editable={isEditing}
                                type="number"
                                onChange={(e) => handleChange("height", e.target.value)}
                             />
                            <TextField
                                label="Current Weight (kg)"
                                value={formData.weight}
                                onChange={(e) => handleChange("weight", e.target.value)}
                                editable={isEditing}
                                type="number"
                            />
                            <TextField
                                label="Goal Weight (kg)"
                                value={formData.goalWeight}
                                onChange={(e) => handleChange("goalWeight", e.target.value)}
                                editable={isEditing}
                                type="number"
                            />
                            <DropDownTextField
                                label="Fitness Goal"
                                value={formData.userGoal}
                                onChange={(e) => handleChange("userGoal", e)}
                                editable={isEditing}
                                options={goalOptions}
                            />
                            <DropDownTextField
                                label="Skill Level"
                                value={formData.skillLevel}
                                onChange={(e) => handleChange("skillLevel", e)}
                                editable={isEditing}
                                options={skillLevelOptions}
                            />
                        </div>


                    </div>
                </div>




            </section>

        </main>
    );
}

export default Profile;