import axios from "axios";
import React, { useEffect, useState } from "react";
import { MuscleGroup } from "../types/MuscleGroup";
import SearchFilterBar from "../components/SearchFilterBar";
import { useAuth } from "../context/AuthContext";
import ExerciseModal from "../components/ExerciseModal";
import { Dumbbell, PlayCircle, Plus } from "lucide-react";
import CreateExerciseModal from "../components/CreateExerciseModal";
import WorkoutAndExerciseCard from "../components/WorkoutAndExerciseCard";

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
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
            ex.primaryMuscleGroup.toLowerCase().includes(search.toLowerCase()) ||
            ex.secondaryMuscleGroup?.toLowerCase().includes(search.toLowerCase()) ||
            ex.tertiaryMuscleGroup?.toLowerCase().includes(search.toLowerCase());

        const matchesMuscle = 
            filters.muscleGroup === "all" || 
            ex.primaryMuscleGroup.includes(filters.muscleGroup) ||
            ex.secondaryMuscleGroup?.includes(filters.muscleGroup) ||
            ex.tertiaryMuscleGroup?.includes(filters.muscleGroup);

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

                        <WorkoutAndExerciseCard
                            key={ex.id}
                            title={ex.name}
                            description={ex.description}
                            icon={<Dumbbell className="w-5 h-5 text-brand-gold" />}
                            badges={[ex.primaryMuscleGroup, ex.secondaryMuscleGroup, ex.tertiaryMuscleGroup].filter(Boolean) as string[]}
                            onClick={() => setSelectedExercise(ex)}
                        />
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