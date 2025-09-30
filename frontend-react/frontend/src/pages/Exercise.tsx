import axios from "axios";
import React, { useEffect, useState } from "react";
import { MuscleGroup } from "../types/MuscleGroup";
import SearchFilterBar from "../components/SearchFilterBar";
import { useAuth } from "../context/AuthContext";
import ExerciseModal from "../components/ExerciseModal";
import { Dumbbell, PlayCircle, Plus } from "lucide-react";
import CreateExerciseModal from "../components/CreateExerciseModal";

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  muscleGroups: string[];
}

const Exercise: React.FC = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const [search, setSearch] = useState("");

    const { token } = useAuth();

    const [showCreatModal, setShowCreatModal] = useState(false);

    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const [filters, setFilters] = useState({
        muscleGroup: "all",
    });

    const fetchExercises = async () => {
        try{
            axios.get("/api/exercise", {headers: { Authorization: `Bearer ${token}` }})
            .then(res => setExercises(res.data))
        } catch (err) {
            console.error("Error fetching exercises:", err);
        }
    };

    useEffect(() => {
       fetchExercises();
    }, []);
    

    const goalOptions = [
        {value: MuscleGroup.CHEST, label: "Chest"},
        {value: MuscleGroup.BACK, label: "Back"},
        {value: MuscleGroup.BICEP, label: "Bicep"},
        {value: MuscleGroup.TRICEP, label: "Tricep"},
        {value: MuscleGroup.SHOULDERS, label: "Shoulder"},
        {value: MuscleGroup.LEG, label: "Leg"},
    ];

    const filterOptions = [
        {
            category: "muscleGroup",
            label: "Muscle Group",
            options: [
                {value: "all", label: "All Groups"},
                ...goalOptions,
            ],
        },
    ];

    const handleFilterChange = (category:string, value:string)=>{
        setFilters((prev) => ({...prev, [category] : value}));
    }

    const filteredExercises = exercises.filter((ex) => {
        const matchesSearch = 
            ex.name.toLowerCase().includes(search.toLowerCase()) || 
            ex.muscleGroups.some(m => m.toLowerCase().includes(search.toLowerCase()));

        const matchesMuscle = 
            filters.muscleGroup === "all" || 
            ex.muscleGroups.includes(filters.muscleGroup);

        return matchesSearch && matchesMuscle;
    });

    return(
        <main className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-1 justify-between  mb-6">
                <h1 className="h1">Exercises</h1>
                    <button
                        className="btn btn-primary flex items-center gap-3"
                        onClick={() => setShowCreatModal(true)}
                    >
                        <Plus size={18}/>
                        Create Exercise
                    </button>
            </div>
                <SearchFilterBar
                    type="text"
                    placeholder="Search exercises..."
                    search={search}
                    onSearchChange={setSearch}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    filterOptions={filterOptions}
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {filteredExercises.map((ex)=> (
                        <div
                            key={ex.id}
                            onClick={() => setSelectedExercise(ex)}
                            className="card card-hover card-hover-gold p-5 flex flex-col cursor-pointer relative h-full"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Dumbbell className="w-5 h-5 text-brand-gold" />
                                    <h2 className="text-lg font-semibold">{ex.name}</h2>
                                </div>
                            </div>
                            <p className="muted mb-6 line-clamp-1">{ex.description || "No description"}</p>

                                
                            <div className="mt-auto flex flex-wrap gap-2">
                                {ex.muscleGroups.map((muscle,idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-2 rounded-md text-xs bg-black/30 border border-brand-goldDark text-brand-gold"
                                        >
                                            {muscle}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedExercise && (
                    <ExerciseModal
                        exercise={selectedExercise}
                        onClose={() => setSelectedExercise(null)}
                    />
                )}

                {showCreatModal && (
                    <CreateExerciseModal
                        onClose={() => setShowCreatModal(false)}
                        onCreated={fetchExercises}
                    />
                )}
        </main>
    );
};

export default Exercise;