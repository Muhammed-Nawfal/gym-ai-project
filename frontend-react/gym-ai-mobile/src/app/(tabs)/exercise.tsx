import { Dumbbell, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import CreateExerciseModal from "../../components/CreateExerciseModal";
import ExerciseModal from "../../components/ExerciseModal";
import SearchFilterBar from "../../components/SearchFilterBar";
import WorkoutAndExerciseCard from "../../components/WorkoutAndExerciseCard";
import { useAuth } from "../../context/AuthContext";
import { MuscleGroup } from "../../types/MuscleGroup";

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
}

export default function ExerciseScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const { token } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filters, setFilters] = useState({ muscleGroup: "all" });

  const fetchExercises = async () => {
    try {
      const res = await client.get("/api/exercise", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercises(res.data);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const muscleGroupOptions = [
    { value: MuscleGroup.CHEST, label: "Chest" },
    { value: MuscleGroup.BACK, label: "Back" },
    { value: MuscleGroup.BICEP, label: "Bicep" },
    { value: MuscleGroup.TRICEP, label: "Tricep" },
    { value: MuscleGroup.SHOULDERS, label: "Shoulder" },
    { value: MuscleGroup.LEG, label: "Leg" },
  ];

  const filterOptions = [
    {
      category: "muscleGroup",
      label: "Muscle Group",
      options: [{ value: "all", label: "All Groups" }, ...muscleGroupOptions],
    },
  ];

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

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.h1}>Exercises</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
                <Plus color="#000000" size={16} />
                <Text style={styles.addButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            <SearchFilterBar
              placeholder="Search exercises..."
              search={search}
              onSearchChange={setSearch}
              filters={filters}
              onFilterChange={(category, value) =>
                setFilters((prev) => ({ ...prev, [category]: value }))
              }
              filterOptions={filterOptions}
            />
          </>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <WorkoutAndExerciseCard
              title={item.name}
              description={item.description}
              icon={<Dumbbell color="#d4af37" size={18} />}
              badges={[item.primaryMuscleGroup, item.secondaryMuscleGroup, item.tertiaryMuscleGroup].filter(
                Boolean
              ) as string[]}
              onPress={() => setSelectedExercise(item)}
            />
          </View>
        )}
      />

      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}

      {showCreateModal && (
        <CreateExerciseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchExercises}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  h1: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d4af37",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 13,
  },
});
