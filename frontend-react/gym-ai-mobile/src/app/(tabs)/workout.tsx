import { BicepsFlexed, Dumbbell, PlayCircle, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import CreateExerciseModal from "../../components/CreateExerciseModal";
import CreateWorkoutModal from "../../components/CreateWorkoutModal";
import ExerciseModal from "../../components/ExerciseModal";
import LogWorkoutPanel from "../../components/LogWorkoutPanel";
import SearchFilterBar from "../../components/SearchFilterBar";
import WorkoutAndExerciseCard from "../../components/WorkoutAndExerciseCard";
import WorkoutDetailModal from "../../components/WorkoutDetailModal";
import { useAuth } from "../../context/AuthContext";
import { MuscleGroup } from "../../types/MuscleGroup";
import { useFocusEffect, useRouter } from "expo-router";
import type { AddWorkoutToRoutineRequest, StartWorkoutRequest, StartWorkoutResponse, WorkoutHistoryDto } from "../../api/types";
import { appColors, goldAlpha, whiteAlpha } from "../../constants/appColors";

interface Workout {
  id: number;
  name: string;
  description: string;
  isPredefined: boolean;
  muscleGroups: MuscleGroup[];
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
}

export default function WorkoutScreen() {
  const { token, user } = useAuth();
  const userId = user ? user.id : null;

  const [activeTab, setActiveTab] = useState<"workouts" | "log" | "exercises">("workouts");

  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [predefinedWorkouts, setPredefinedWorkouts] = useState<Workout[]>([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingPredefined, setLoadingPredefined] = useState(false);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editWorkoutId, setEditWorkoutId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ muscleGroup: "all" });

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const [activeSession, setActiveSession] = useState<StartWorkoutResponse | null>(null);
  const [logView, setLogView] = useState<"list" | "session">("list");

  const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false);

  const router = useRouter();
  const [history, setHistory] = useState<WorkoutHistoryDto[]>([]);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseFilters, setExerciseFilters] = useState({ muscleGroup: "all" });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

  const fetchExercises = async () => {
    try {
      const res = await client.get("/api/exercise", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercises(res.data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchUserWorkouts = async () => {
    if (!userId) return;
    try {
      setLoadingUser(true);
      const res = await client.get(`/api/workout/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserWorkouts(res.data || []);
    } catch (err) {
      console.error("Error fetching user workouts:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPredefinedWorkouts = async () => {
    try {
      setLoadingPredefined(true);
      const res = await client.get(`/api/workout/predefined`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPredefinedWorkouts(res.data || []);
    } catch (err) {
      console.error("Error fetching predefined workouts:", err);
    } finally {
      setLoadingPredefined(false);
    }
  };

  useEffect(() => {
    fetchUserWorkouts();
    fetchPredefinedWorkouts();
  }, [userId]);

  const fetchActiveWorkoutSession = async () => {
    if (!userId) return null;

    try {
      const res = await client.get<StartWorkoutResponse>(`/api/workout-sessions/user/${userId}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.workoutEntryId) {
        setActiveSession(res.data);
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };
  

  const fetchWorkoutHistory = async () => {
    if (!userId) return;
    try {
      const res = await client.get<WorkoutHistoryDto[]>(`/api/workout-sessions/user/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching workout history:", err);
    }
  };

  useEffect(() => {
    if (activeTab !== "log" || !userId) return;

    fetchActiveWorkoutSession().then((s) => {
      if (s?.workoutEntryId) {
        setActiveSession(s);
        setLogView((prev) => (prev === "session" ? "session" : "list"));
      } else {
        setActiveSession(null);
        setLogView("list");
      }
    });
    fetchWorkoutHistory();
  }, [activeTab, userId, token]);

  // Refetch history when returning to this screen (e.g. after deleting an
  // entry from the history detail page) - the effect above only runs when
  // activeTab/userId/token change, which doesn't cover navigating back.
  useFocusEffect(
    useCallback(() => {
      if (activeTab === "log") fetchWorkoutHistory();
    }, [activeTab, userId, token])
  );

  const muscleOptions = [
    { value: MuscleGroup.CHEST, label: "Chest" },
    { value: MuscleGroup.BACK, label: "Back" },
    { value: MuscleGroup.BICEP, label: "Bicep" },
    { value: MuscleGroup.TRICEP, label: "Tricep" },
    { value: MuscleGroup.SHOULDERS, label: "Shoulder" },
    { value: MuscleGroup.LEG, label: "Leg" },
  ];

  const filterOptions = [
    { category: "muscleGroup", label: "Muscle Group", options: [{ value: "all", label: "All Groups" }, ...muscleOptions] },
  ];

  const { myWorkouts, predefinedWorkoutsFromUserList } = useMemo(() => {
    const mine = (userWorkouts || []).filter((w) => !w.isPredefined);
    const predefinedFromUserList = (userWorkouts || []).filter((w) => w.isPredefined);
    return { myWorkouts: mine, predefinedWorkoutsFromUserList: predefinedFromUserList };
  }, [userWorkouts]);

  const allPredefined = useMemo(() => {
    const map = new Map();
    [...(predefinedWorkouts || []), ...(predefinedWorkoutsFromUserList || [])].forEach((w) => map.set(w.id, w));
    return Array.from(map.values());
  }, [predefinedWorkouts, predefinedWorkoutsFromUserList]);

  const showMyWorkoutsSection = myWorkouts.length > 0;

  const matchesFilters = (w: Workout) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.muscleGroups || []).some((mg) => String(mg).toLowerCase().includes(search.toLowerCase()));

    const matchesMuscle =
      filters.muscleGroup === "all" || (w.muscleGroups || []).includes(filters.muscleGroup as any);

    return matchesSearch && matchesMuscle;
  };

  const filteredMyWorkouts = useMemo(() => myWorkouts.filter(matchesFilters), [myWorkouts, search, filters]);
  const filteredAllPredefined = useMemo(() => allPredefined.filter(matchesFilters), [allPredefined, search, filters]);

  const exerciseFilterOptions = [
    {
      category: "muscleGroup",
      label: "Muscle Group",
      options: [{ value: "all", label: "All Groups" }, ...muscleOptions],
    },
  ];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.primaryMuscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.secondaryMuscleGroup?.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.tertiaryMuscleGroup?.toLowerCase().includes(exerciseSearch.toLowerCase());

      const matchesMuscle =
        exerciseFilters.muscleGroup === "all" ||
        ex.primaryMuscleGroup.includes(exerciseFilters.muscleGroup) ||
        ex.secondaryMuscleGroup?.includes(exerciseFilters.muscleGroup) ||
        ex.tertiaryMuscleGroup?.includes(exerciseFilters.muscleGroup);

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, exerciseSearch, exerciseFilters]);

  const handleStartWorkout = async (workoutId: number) => {
    if (!userId) return;

    const existing = await fetchActiveWorkoutSession();

    if (existing?.workoutEntryId) {
      setActiveSession(existing);
      setLogView("session");
      setActiveTab("log");
      setDetailOpen(false);
      setSelectedWorkout(null);
      return;
    }

    const payload: StartWorkoutRequest = { userId, workoutId };

    try {
      const res = await client.post<StartWorkoutResponse>("/api/workout-sessions/start", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveSession(res.data);
      setLogView("session");
      setActiveTab("log");
      setDetailOpen(false);
      setSelectedWorkout(null);
    } catch (err) {
      console.error("Error starting workout:", err);
    }
  };

  const handleAddToRoutine = async (workoutId: number) => {
    if (!userId) return;

    const payload: AddWorkoutToRoutineRequest = { userId, workoutId };

    await client.post("/api/workout/add-to-routine", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUserWorkouts();
  };

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkoutId(workout.id);
    setSelectedWorkout(workout);
    setDetailOpen(true);
  };

  // Stable reference: LogWorkoutPanel's effect depends on this callback, so
  // an inline arrow function here (recreated every render) would re-fire
  // that effect on every unrelated re-render, feeding back into this
  // component's own state and causing an infinite update loop.
  const handleSessionUpdated = useCallback((s: StartWorkoutResponse) => {
    setActiveSession(s);
  }, []);

  if (activeSession && logView === "session") {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <LogWorkoutPanel
          session={activeSession}
          onClose={() => setLogView("list")}
          onSessionUpdated={handleSessionUpdated}
          onFinished={() => {
            setActiveSession(null);
            setLogView("list");
          }}
        />
      </SafeAreaView>
    );
  }

  const formatHistoryDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.h1}>{activeTab === "exercises" ? "Exercises" : "Workouts"}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              activeTab === "exercises" ? setShowCreateExerciseModal(true) : setShowCreateWorkoutModal(true)
            }
          >
            <Plus color={appColors.black} size={16} />
            <Text style={styles.addButtonText}>{activeTab === "exercises" ? "Create" : "Add"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "workouts" && styles.tabButtonActive]}
            onPress={() => setActiveTab("workouts")}
          >
            <Dumbbell color={activeTab === "workouts" ? appColors.gold : appColors.muted} size={16} />
            <Text style={[styles.tabButtonText, activeTab === "workouts" && styles.tabButtonTextActive]}>
              Workouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "log" && styles.tabButtonActive]}
            onPress={() => setActiveTab("log")}
          >
            <PlayCircle color={activeTab === "log" ? appColors.gold : appColors.muted} size={16} />
            <Text style={[styles.tabButtonText, activeTab === "log" && styles.tabButtonTextActive]}>
              Log Workouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "exercises" && styles.tabButtonActive]}
            onPress={() => setActiveTab("exercises")}
          >
            <BicepsFlexed color={activeTab === "exercises" ? appColors.gold : appColors.muted} size={16} />
            <Text style={[styles.tabButtonText, activeTab === "exercises" && styles.tabButtonTextActive]}>
              Exercises
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "workouts" && (
          <View style={{ gap: 24 }}>
            <SearchFilterBar
              placeholder="Search workouts..."
              search={search}
              onSearchChange={setSearch}
              filters={filters}
              onFilterChange={(category, value) => setFilters((prev) => ({ ...prev, [category]: value }))}
              filterOptions={filterOptions}
            />

            {showMyWorkoutsSection && (
              <View>
                <Text style={styles.h2}>My Workouts</Text>
                {loadingUser ? (
                  <Text style={styles.muted}>Loading...</Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {filteredMyWorkouts.map((w) => (
                      <WorkoutAndExerciseCard
                        key={w.id}
                        title={w.name}
                        description={w.description}
                        icon={<Dumbbell color={appColors.gold} size={18} />}
                        badges={(w.muscleGroups || []).map((mg) => String(mg))}
                        onPress={() => handleWorkoutClick(w)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            <View>
              <Text style={styles.h2}>Predefined Workouts</Text>
              {loadingPredefined ? (
                <Text style={styles.muted}>Loading...</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {filteredAllPredefined.map((w) => (
                    <WorkoutAndExerciseCard
                      key={w.id}
                      title={w.name}
                      description={w.description}
                      icon={<Dumbbell color={appColors.gold} size={18} />}
                      badges={(w.muscleGroups || []).map((mg: MuscleGroup) => String(mg))}
                      onPress={() => handleWorkoutClick(w)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === "log" && (
          <View style={{ gap: 20 }}>
            {activeSession && (
              <View style={styles.activeSessionCard}>
                <Text style={styles.activeSessionTitle}>Workout in progress</Text>
                <Text style={styles.muted}>
                  You can't start another workout until you finish or discard the current one.
                </Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setLogView("session")}>
                  <Text style={styles.addButtonText}>Resume</Text>
                </TouchableOpacity>
              </View>
            )}

            <View>
              <Text style={styles.h2}>Start a Workout</Text>
              <View style={{ gap: 12 }}>
                {filteredMyWorkouts.map((w) => (
                  <WorkoutAndExerciseCard
                    key={w.id}
                    title={w.name}
                    description={w.description}
                    icon={<Dumbbell color={appColors.gold} size={18} />}
                    badges={(w.muscleGroups || []).map((mg: MuscleGroup) => String(mg))}
                    onPress={() => {
                      if (activeSession?.workoutEntryId) {
                        setLogView("session");
                        return;
                      }
                      handleWorkoutClick(w);
                      setSelectedWorkout(w);
                    }}
                  />
                ))}
              </View>
            </View>

            {history.length > 0 && (
              <View>
                <Text style={styles.h2}>Workout History</Text>
                <View style={{ gap: 12 }}>
                  {history.map((h) => (
                    <WorkoutAndExerciseCard
                      key={h.workoutEntryId}
                      title={h.workoutName}
                      description={formatHistoryDate(h.completedAt)}
                      icon={<Dumbbell color={appColors.gold} size={18} />}
                      badges={[`${h.totalSets} sets`, `${Math.round(h.totalVolume)} kg volume`]}
                      onPress={() =>
                        router.push({
                          pathname: "/workout-history/[id]",
                          params: { id: String(h.workoutEntryId), completedAt: h.completedAt },
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === "exercises" && (
          <View style={{ gap: 24 }}>
            <SearchFilterBar
              placeholder="Search exercises..."
              search={exerciseSearch}
              onSearchChange={setExerciseSearch}
              filters={exerciseFilters}
              onFilterChange={(category, value) => setExerciseFilters((prev) => ({ ...prev, [category]: value }))}
              filterOptions={exerciseFilterOptions}
            />

            <View style={{ gap: 12 }}>
              {filteredExercises.map((ex) => (
                <WorkoutAndExerciseCard
                  key={ex.id}
                  title={ex.name}
                  description={ex.description}
                  icon={<BicepsFlexed color={appColors.gold} size={18} />}
                  badges={[ex.primaryMuscleGroup, ex.secondaryMuscleGroup, ex.tertiaryMuscleGroup].filter(
                    Boolean
                  ) as string[]}
                  onPress={() => setSelectedExercise(ex)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {showCreateWorkoutModal && (
        <CreateWorkoutModal
          mode="create"
          onClose={() => setShowCreateWorkoutModal(false)}
          onSaved={() => {
            fetchUserWorkouts();
            setShowCreateWorkoutModal(false);
          }}
        />
      )}

      {detailOpen && selectedWorkoutId && selectedWorkout && (
        <WorkoutDetailModal
          isOpen={detailOpen}
          workoutId={selectedWorkoutId}
          onStartWorkout={handleStartWorkout}
          onAddToRoutine={handleAddToRoutine}
          onClose={() => {
            setDetailOpen(false);
            setSelectedWorkoutId(null);
            setSelectedWorkout(null);
          }}
          onEditWorkout={(workoutId) => {
            setDetailOpen(false);
            setEditWorkoutId(workoutId);
          }}
          isPredefined={selectedWorkout.isPredefined}
          onDelete={() => {
            fetchUserWorkouts();
            fetchPredefinedWorkouts();
          }}
        />
      )}

      {editWorkoutId && (
        <CreateWorkoutModal
          mode="edit"
          workoutId={editWorkoutId}
          onClose={() => setEditWorkoutId(null)}
          onSaved={() => {
            fetchUserWorkouts();
            setEditWorkoutId(null);
          }}
        />
      )}

      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}

      {showCreateExerciseModal && (
        <CreateExerciseModal
          onClose={() => setShowCreateExerciseModal(false)}
          onCreated={fetchExercises}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.black,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  h1: {
    color: appColors.white,
    fontSize: 22,
    fontWeight: "600",
  },
  h2: {
    color: appColors.ink,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  muted: {
    color: appColors.muted,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: appColors.black,
    fontWeight: "600",
    fontSize: 13,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: whiteAlpha(0.1),
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    borderColor: appColors.gold,
  },
  tabButtonText: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: appColors.gold,
  },
  activeSessionCard: {
    borderWidth: 1,
    borderColor: goldAlpha(0.25),
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  activeSessionTitle: {
    color: appColors.gold,
    fontSize: 16,
    fontWeight: "600",
  },
});
