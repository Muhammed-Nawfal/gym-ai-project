import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import type { AddWorkoutToRoutineRequest, StartWorkoutRequest, StartWorkoutResponse } from "../api/types";
import WorkoutAndExerciseCard from "../components/WorkoutAndExerciseCard";
import { ClipboardList, Dumbbell, PlayCircle, Plus } from "lucide-react";
import { MuscleGroup } from "../types/MuscleGroup";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import SearchFilterBar from "../components/SearchFilterBar";
import LogWorkoutPanel from "../components/LogWorkoutPanel";
import CreateWorkoutModal from "../components/CreateWorkoutModal";

interface Workout {
    id: number;
    name: string;
    description: string;
    isPredefined: boolean;
    muscleGroups: MuscleGroup[];
}

const Workout: React.FC = () => {
    const { token, user } = useAuth();
    const userId = user ? user.id : null;

    const [activeTab, setActiveTab] = useState("workouts"); 

    const[ userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
    const [predefinedWorkouts, setPredefinedWorkouts] = useState<Workout[]>([]);

    const [loading , setLoading] = useState(false);
    const [ loadingUser, setLoadingUser] = useState(false);
    const [ loadingPredefined, setLoadingPredefined] = useState (false);

    const[ selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
    const[ detailOpen , setDetailOpen] = useState(false);

    const [editWorkoutId, setEditWorkoutId] = useState<number | null>(null);

    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
      muscleGroup: "all",
    });

    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    const [activeSession, setActiveSession] = useState<StartWorkoutResponse | null>(null);
    const [logView, setLogView] = useState<"list" | "session">("list");
    const [checkingActiveSession, setCheckingActiveSession] = useState(false);

    const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false);

    const fetchUserWorkouts = async () => {
        if(!userId) return;
        try{
            setLoadingUser(true);
            const res = await axios.get(`/api/workout/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserWorkouts (res.data || []);

        } catch (err) {
            console.error("Error fetching user workouts:", err);
        } finally {
            setLoadingUser(false);
        }

    };

    const fetchPredefinedWorkouts = async () => {
        try{
            setLoadingPredefined (true);
            const res = await axios.get(`/api/workout/predefined`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPredefinedWorkouts (res.data || []);
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
      if(!userId) return null;

      // setCheckingActiveSession(true);

      try{
        const res = await axios.get<StartWorkoutResponse>(
          `/api/workout-sessions/user/${userId}/active`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if(res.data?.workoutEntryId){
          setActiveSession(res.data);
          return res.data;
        }

        return null;
      } catch {
        return null; // treat as "no active session"
      } 
      // finally {
      //     setCheckingActiveSession(false);
      //   }
    };

    useEffect(() => {
      if(activeTab !== "log") return;
      if(!userId) return;

      fetchActiveWorkoutSession().then((s) => {
        if(s?.workoutEntryId) {
          setActiveSession(s);
          setLogView((prev) => (prev === "session" ? "session" : "list"));
        } else {
          setActiveSession(null);
          setLogView("list");
        }
      })
    }, [activeTab, userId, token]);


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

    const handleFilterChange = (category: string, value: string) => {
      setFilters((prev) => ({ ...prev, [category]: value }));
    };

    const { myWorkouts, predefinedWorkoutsFromUserList } = useMemo(() => {

        const mine = (userWorkouts || []).filter((w) => !w.isPredefined);
        const predefinedFromUserList = (userWorkouts || []).filter((w) => w.isPredefined);

        return { myWorkouts: mine, predefinedWorkoutsFromUserList: predefinedFromUserList };
    }, [userWorkouts]);

    const allPredefined = useMemo(() => {

        const map = new Map();

        [...(predefinedWorkouts || []), ...(predefinedWorkoutsFromUserList || [])].forEach((workout) => {
            map.set(workout.id, workout);
        });

        console.log("All Predefined Workouts:", Array.from(map.values()));

        return Array.from(map.values());
    }, [predefinedWorkouts, predefinedWorkoutsFromUserList]);

    const showMyWorkoutsSection = myWorkouts.length > 0;

    const filteredMyWorkouts = useMemo(() => {
      return (myWorkouts || []).filter((w) => {
        const matchesSearch =
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          (w.muscleGroups || []).some((mg) => String(mg).toLowerCase().includes(search.toLowerCase()));

        const matchesMuscle =
          filters.muscleGroup === "all" ||
          (w.muscleGroups || []).includes(filters.muscleGroup as any);

        return matchesSearch && matchesMuscle;
      });
    }, [myWorkouts, search, filters]);

    const filteredAllPredefined = useMemo(() => {
      return (allPredefined || []).filter((w) => {
        const matchesSearch =
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          (w.muscleGroups || []).some((mg: MuscleGroup) => String(mg).toLowerCase().includes(search.toLowerCase()));

        const matchesMuscle =
          filters.muscleGroup === "all" ||
          (w.muscleGroups || []).includes(filters.muscleGroup as any);

        return matchesSearch && matchesMuscle;
      });
    }, [allPredefined, search, filters]);

    const handleStartWorkout = async (workoutId: number) => {

      if(!userId) return;

      const existing = await fetchActiveWorkoutSession();

      if (existing?.workoutEntryId) {
        setActiveSession(existing);
        setLogView("session");
        setActiveTab("log"); 
        setDetailOpen(false);
        setSelectedWorkout(null);
        return;
      }
        

        const payload : StartWorkoutRequest = {
            userId: userId,
            workoutId: workoutId,
        };

        try{
            const res = await axios.post<StartWorkoutResponse>(
                "/api/workout-sessions/start",
                payload,
                {headers: { Authorization: `Bearer ${token}` }}
            );
            setActiveSession(res.data);
            setLogView("session");
            setActiveTab("log");
            setDetailOpen(false);
            setSelectedWorkout(null);
        } catch (err) {
            console.error("Error starting workout:", err);
        }
    }

    const handleAddToRoutine = async (workoutId: number) => {
      if (!userId) return;

      const payload : AddWorkoutToRoutineRequest = {
            userId: userId,
            workoutId: workoutId,
        };

      await axios.post(
        "/api/workout/add-to-routine",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchUserWorkouts();
    };


    const handleWorkoutClick = (workout: Workout) => {
        setSelectedWorkoutId(workout.id);
        setSelectedWorkout(workout);
        setDetailOpen(true);
    };

    const isWorkoutAlreadyInMyWorkouts = (workoutId:number) => {
      return (userWorkouts ?? []).some((w) => w.id == workoutId);
    }

    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="h1">Workouts</h1>

          {logView === "list" && (
            <button
              className="btn btn-primary flex items-center gap-3"
              onClick={() => setShowCreateWorkoutModal(true)}
            >
              <Plus size={18} />
              Add Workout
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-8">
          <button
            className={`btn-list flex items-center gap-3 ${
              activeTab === "workouts" ? "border-brand-gold text-brand-gold" : ""
            }`}
            onClick={() => setActiveTab("workouts")}
          >
            <Dumbbell className="w-5 h-5" />
            Workouts
          </button>

          <button
            className={`btn-list flex items-center gap-3 ${
              activeTab === "log" ? "border-brand-gold text-brand-gold" : ""
            }`}
            onClick={() => setActiveTab("log")}
          >
            <PlayCircle className="w-5 h-5" />
            Log Workouts
          </button>
        </div>

        {activeTab === "workouts" && (
          <div className="space-y-10">
            <SearchFilterBar
                type="text"
                placeholder="Search workouts..."
                search={search}
                onSearchChange={setSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                filterOptions={filterOptions}
            />
            {showMyWorkoutsSection && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="h2">My Workouts</h2>
                </div>

                {loadingUser ? (
                  <p className="muted">Loading...</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {filteredMyWorkouts.map((w) => (
                      <WorkoutAndExerciseCard
                        key={w.id}
                        title={w.name}
                        description={w.description}
                        icon={<Dumbbell className="w-5 h-5 text-brand-gold" />}
                        badges={(w.muscleGroups || []).map((mg) => String(mg))}
                        onClick={() => handleWorkoutClick(w)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="h2">Predefined Workouts</h2>
              </div>

              {loadingPredefined ? (
                <p className="muted">Loading...</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {filteredAllPredefined.map((w) => (
                    <WorkoutAndExerciseCard
                      key={w.id}
                      title={w.name}
                      description={w.description}
                      icon={<Dumbbell className="w-5 h-5 text-brand-gold" />}
                      badges={(w.muscleGroups || []).map((mg : MuscleGroup) => String(mg))}
                      onClick={() => handleWorkoutClick(w)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "log" && (
          <div className="space-y-6">
            {activeSession && logView === "session" ? (
              <div className="mt-6">
                <LogWorkoutPanel
                  session={activeSession}
                  onClose={() => setLogView("list")}
                  onSessionUpdated={(s) => setActiveSession(s)}
                  onFinished={() => {
                    setActiveSession(null);
                    setLogView("list");
                  }}
                />
              </div>
            ) : (
              <>
                {activeSession && (

                <div className="card p-5 border border-brand-gold/25">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-brand-gold">
                        Workout in progress
                      </p>
                      <p className="muted mt-1">
                        You can’t start another workout until you finish or discard the current one.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => setLogView("session")}
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                </div>                  
                )}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="h2">Start a Workout</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredMyWorkouts.map((w) => (
                  <WorkoutAndExerciseCard
                      key={w.id}
                      title={w.name}
                      description={w.description}
                      icon={<Dumbbell className="w-5 h-5 text-brand-gold" />}
                      badges={(w.muscleGroups || []).map((mg : MuscleGroup) => String(mg))}
                      onClick={() => {
                        if(activeSession?.workoutEntryId){
                          setLogView("session");
                          return;
                        }
                        handleWorkoutClick(w);
                        setSelectedWorkout(w);
                      }}
                    />
                ))}
              </div>
            </section>
          </>
        )}

        
        </div>
      )}

        {showCreateWorkoutModal && (
          <CreateWorkoutModal
            mode = "create"
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
      </main>
  );
};

export default Workout;