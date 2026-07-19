import { Dialog, DialogTitle } from "@headlessui/react";
import axios from "axios";
import { Dumbbell, PlayCircle, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { WorkoutDetail, WorkoutExercise } from "../api/types";
import { useAuth } from "../context/AuthContext";
import DialogBoxModal from "./DialogBoxModal";

type WorkoutDetailModalProps = {
    workoutId: number;
    isOpen: boolean;
    onClose: () => void;
    onStartWorkout: (workoutId: number) => void;
    onAddToRoutine: (workoutId: number) => void;
    onEditWorkout?: (workoutId: number) => void;
    onDelete : () => void;
    isPredefined: boolean;
};

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({ workoutId, isOpen, onClose, onStartWorkout, onAddToRoutine, isPredefined, onEditWorkout, onDelete }) => {
    if (!isOpen) return null;

    const { token, user } = useAuth();
    const [workoutDetail, setWorkoutDetail] = useState<WorkoutDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!isOpen || !workoutId) return;

        setLoading(true);

        axios
            .get(`/api/workout/${workoutId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res : any) => setWorkoutDetail(res.data))
            .catch((err : any) => setError("Failed to load workout details"))
            .finally(() => setLoading(false));
    }, [isOpen, workoutId, token]);

    const canEdit =
      !!workoutDetail &&
      workoutDetail.isPredefined === false &&
      workoutDetail.userId === user?.id;

    const handleDeleteWorkout = async() => {
      setError(null);

      if (!canEdit) {
        setError("You can only delete your own workouts.");
        return;
      }

        try{
          await axios.delete(`/api/workout/${workoutId}`, { 
            headers: { Authorization: `Bearer ${token}`} 
          });
          onClose();
          onDelete();
        }
        catch (err){
          setError("Failed");
        } 
    };


    return (
        <DialogBoxModal 
            open={isOpen} 
            onClose={onClose}
            title={workoutDetail ? workoutDetail.name : "Workout Details"}
            icon={<Dumbbell/>}
            headerActions={
              canEdit && (
                <button
                  onClick={handleDeleteWorkout}
                  className="h-9 w-9 flex items-center justify-center rounded-full border border-red-600 text-red-600 hover:text-red-300 hover:bg-red-500/10 hover: border-red-500 transition"
                  title="Delete workout"
                >
                  <Trash2 size={18} />
                </button>
              )
            }
            >

          {loading && <p className="muted mt-4">Loading exercises...</p>}

          {workoutDetail?.description && (
            <p className="muted mt-4">{workoutDetail.description}</p>
          )}

          {workoutDetail && (
            <div className="mt-4 rounded-xl border border-brand-gold/30 bg-black/35 px-6 py-4">
              <div className="grid grid-cols-2 divide-x divide-white/10 text-center">

                <div className="flex flex-col items-center gap-1">
                  <p className="text-2xl font-semibold">
                    {workoutDetail.exercises.length}
                  </p>
                  <p className="text-s text-white/60">Exercises</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <p className="text-2xl font-semibold">
                    {workoutDetail.exercises.reduce(
                      (sum, ex) => sum + (ex.targetSets ?? 0),
                      0
                    )}
                  </p>
                  <p className="text-s text-white/60">Total Sets</p>
                </div>

              </div>
            </div>
          )}

          {workoutDetail && (
            <div className="mt-6">
              <p className="muted mb-3 text-lg">Exercise Details</p>

              <div className="space-y-4">
                {workoutDetail.exercises.map((ex: WorkoutExercise) => {
                  const muscle =
                    ex.primaryMuscleGroup ??
                    "";
                  return (
                    <div
                      key={ex.id}
                      className="rounded-2xl border border-brand-gold/30 bg-black/35 px-6 py-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                          <p className="text-lg font-semibold text-white">
                            {ex.exerciseName}
                          </p>

                          {muscle ? (
                            <span className="inline-flex items-center rounded-full border border-brand-gold/40 bg-black/40 px-3 py-1 text-xs font-medium text-brand-gold">
                              {String(muscle)}
                            </span>
                          ) : null}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-black/40 px-4 py-3">
                          <p className="text-xs muted">Sets</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {ex.targetSets ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-black/40 px-4 py-3">
                          <p className="text-xs muted">Reps</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {ex.targetReps ?? "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        <div className="mt-6 flex justify-start gap-2">
            {isPredefined && (
              <button
                onClick={() => onAddToRoutine(workoutId)}
                className="btn btn-primary flex items-center gap-2"
              >
                Add to My Workouts
              </button>

            )}
            
            {!isPredefined && (
               <button
                  onClick={() => onStartWorkout(workoutId)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Start Workout
                </button>

            )}

            {canEdit && onEditWorkout && (
              <button
                onClick={() => onEditWorkout(workoutId)}
                className="btn btn-secondary flex items-center gap-2"
              >
                Edit Workout
              </button>
            )}

            <button onClick={onClose} className="btn btn-danger flex items-center gap-2">
                Close
            </button>
        </div>
      </DialogBoxModal>
  );
};

export default WorkoutDetailModal;