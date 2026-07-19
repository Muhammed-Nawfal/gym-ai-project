import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Plus,
  Save,
  Trash2,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import client from "../api/client";
import type { SessionExerciseDto, SessionSetDto, StartWorkoutResponse } from "../api/types";
import { useAuth } from "../context/AuthContext";
import ChooseExercisesModal from "./ChooseExercisesModal";

type LogWorkoutPanelProps = {
  session: StartWorkoutResponse;
  onClose: () => void;
  onSessionUpdated?: (s: StartWorkoutResponse) => void;
  onFinished: () => void;
};

type UpdateSetPayload = {
  weight?: number | null;
  reps?: number | null;
  completed?: boolean;
};

type UpdateExercisePayload = {
  notes?: string;
  restSeconds?: number;
  orderIndex?: number;
};

type DraftSetPatch = {
  weight?: number | null;
  reps?: number | null;
  completed?: boolean;
};

type DraftExercisePatch = {
  sets?: Record<string, DraftSetPatch>;
};

type SessionDraft = {
  notes?: Record<number, string>;
  exercises?: Record<string, DraftExercisePatch>;
};

const draftKey = (workoutEntryId: number) => `gym_ai_active_session_draft:${workoutEntryId}`;

export default function LogWorkoutPanel({
  session,
  onClose,
  onSessionUpdated,
  onFinished,
}: LogWorkoutPanelProps) {
  const { token } = useAuth();
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [working, setWorking] = useState<StartWorkoutResponse>(session);

  const [notesByEx, setNotesByEx] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    (session.exercises ?? []).forEach((ex: SessionExerciseDto) => {
      init[ex.workoutEntryExerciseId] = ex.notes ?? "";
    });
    return init;
  });

  const [openExerciseIds, setOpenExerciseIds] = useState<Set<number>>(() => new Set());

  const [activeRestExerciseId, setActiveRestExerciseId] = useState<number | null>(null);
  const [restLeft, setRestLeft] = useState<number | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [savingSetIds, setSavingSetIds] = useState<Set<number>>(new Set());
  const [savingNotesIds, setSavingNotesIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [restEditForId, setRestEditForId] = useState<number | null>(null);
  const [restDraftSeconds, setRestDraftSeconds] = useState<Record<number, string>>({});

  const [chooseExerciseOpen, setChooseExerciseOpen] = useState(false);

  // Only re-sync from the prop when it's actually a different workout entry
  // (e.g. resuming a different session) - not on every parent re-render,
  // since `working` itself is what feeds the session back up to the parent
  // (see the onSessionUpdated effect below). Resetting on every reference
  // change would fight with that and clobber in-progress local edits.
  useEffect(() => {
    setWorking(session);
  }, [session.workoutEntryId]);

  // Load any offline draft saved from a previous session on this device.
  useEffect(() => {
    AsyncStorage.getItem(draftKey(session.workoutEntryId))
      .then((raw) => {
        if (!raw) return;
        const draft: SessionDraft = JSON.parse(raw);

        if (draft.notes) {
          setNotesByEx((prev) => ({ ...prev, ...draft.notes }));
        }

        if (draft.exercises) {
          setWorking((prev) => ({
            ...prev,
            exercises: (prev.exercises ?? []).map((ex) => {
              const draftEx = draft.exercises?.[String(ex.workoutEntryExerciseId)];
              if (!draftEx) return ex;

              const nextSets = (ex.currentSets ?? []).map((s) => {
                const draftSet = draftEx.sets?.[String(s.id)];
                if (!draftSet) return s;

                return {
                  ...s,
                  weight: draftSet.weight ?? s.weight,
                  reps: draftSet.reps ?? s.reps,
                  completed: typeof draftSet.completed === "boolean" ? draftSet.completed : s.completed,
                };
              });

              return { ...ex, currentSets: nextSets };
            }),
          }));
        }
      })
      .catch(() => {});
  }, [session.workoutEntryId]);

  // Persist the draft to AsyncStorage on every change, debounced.
  useEffect(() => {
    const t = setTimeout(() => {
      const draft: SessionDraft = { notes: notesByEx, exercises: {} };
      (working.exercises ?? []).forEach((ex: SessionExerciseDto) => {
        draft.exercises![String(ex.workoutEntryExerciseId)] = {
          sets: Object.fromEntries(
            (ex.currentSets ?? []).map((s: SessionSetDto) => [
              String(s.id),
              { weight: s.weight, reps: s.reps, completed: s.completed },
            ])
          ),
        };
      });
      AsyncStorage.setItem(draftKey(working.workoutEntryId), JSON.stringify(draft)).catch(() => {});
    }, 300);

    return () => clearTimeout(t);
  }, [working, notesByEx]);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    };
  }, []);

  const totals = useMemo(() => {
    let totalSets = 0;
    let doneSets = 0;
    let volume = 0;

    (working.exercises ?? []).forEach((ex: SessionExerciseDto) => {
      (ex.currentSets ?? []).forEach((s: SessionSetDto) => {
        totalSets += 1;
        if (s.completed) {
          doneSets += 1;
          volume += Number(s.weight ?? 0) * Number(s.reps ?? 0);
        }
      });
    });

    return { totalSets, doneSets, volume };
  }, [working]);

  const toggleExerciseOpen = (workoutEntryExerciseId: number) => {
    setOpenExerciseIds((prev) => {
      const next = new Set(prev);
      next.has(workoutEntryExerciseId) ? next.delete(workoutEntryExerciseId) : next.add(workoutEntryExerciseId);
      return next;
    });
  };

  const startRestTimer = (workoutEntryExerciseId: number, seconds: number) => {
    if (!seconds || seconds <= 0) return;
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);

    setActiveRestExerciseId(workoutEntryExerciseId);
    setRestLeft(seconds);

    restIntervalRef.current = setInterval(() => {
      setRestLeft((prev) => {
        if (prev == null) return null;
        if (prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          restIntervalRef.current = null;
          setActiveRestExerciseId(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateLocalSet = (setId: number, patch: UpdateSetPayload) => {
    setWorking((prev) => ({
      ...prev,
      exercises: (prev.exercises ?? []).map((ex: SessionExerciseDto) => ({
        ...ex,
        currentSets: (ex.currentSets ?? []).map((s: SessionSetDto) => (s.id === setId ? { ...s, ...patch } : s)),
      })),
    }));
  };

  const saveSetInBackend = async (setId: number, payload: UpdateSetPayload) => {
    setError(null);
    setSavingSetIds((prev) => new Set(prev).add(setId));

    try {
      const res = await client.put(`/api/workout-sessions/${setId}/update-set`, payload, {
        headers: authHeaders,
      });

      const updated: SessionSetDto = res.data;
      updateLocalSet(setId, {
        weight: updated.weight ?? null,
        reps: updated.reps ?? null,
        completed: updated.completed,
      });
    } catch {
      setError("Failed to save set. Try again.");
    } finally {
      setSavingSetIds((prev) => {
        const next = new Set(prev);
        next.delete(setId);
        return next;
      });
    }
  };

  const addSet = async (workoutEntryExerciseId: number) => {
    setError(null);
    try {
      const res = await client.post(`/api/workout-sessions/${workoutEntryExerciseId}/add-set`, null, {
        headers: authHeaders,
      });
      const newSet = res.data;

      setWorking((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.workoutEntryExerciseId === workoutEntryExerciseId
            ? { ...ex, currentSets: [...(ex.currentSets ?? []), newSet] }
            : ex
        ),
      }));
    } catch {
      setError("Failed to add set.");
    }
  };

  const deleteSet = async (setId: number) => {
    setError(null);
    try {
      await client.delete(`/api/workout-sessions/${setId}/delete-set`, { headers: authHeaders });

      setWorking((prev) => ({
        ...prev,
        exercises: (prev.exercises ?? []).map((ex: SessionExerciseDto) => ({
          ...ex,
          currentSets: (ex.currentSets ?? []).filter((s: SessionSetDto) => s.id !== setId),
        })),
      }));
    } catch {
      setError("Failed to delete set.");
    }
  };

  const updateExercise = async (workoutEntryExId: number, patch: UpdateExercisePayload) => {
    setError(null);
    setSavingNotesIds((prev) => new Set(prev).add(workoutEntryExId));

    try {
      const res = await client.put(`/api/workout-sessions/exercises/${workoutEntryExId}`, patch, {
        headers: authHeaders,
      });
      const updated: SessionExerciseDto = res.data;

      setWorking((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => (ex.workoutEntryExerciseId === workoutEntryExId ? updated : ex)),
      }));

      if (typeof updated.notes === "string") {
        setNotesByEx((prev) => ({ ...prev, [workoutEntryExId]: updated.notes! }));
      }
    } catch {
      setError("Failed to update exercise.");
    } finally {
      setSavingNotesIds((prev) => {
        const next = new Set(prev);
        next.delete(workoutEntryExId);
        return next;
      });
    }
  };

  const saveNotes = async (workoutEntryExId: number) => {
    const notes = (notesByEx[workoutEntryExId] ?? "").trim();
    await updateExercise(workoutEntryExId, { notes });
  };

  const finishWorkout = async () => {
    setError(null);
    try {
      await client.post(`/api/workout-sessions/${working.workoutEntryId}/finish-workout`, null, {
        headers: authHeaders,
      });
      await AsyncStorage.removeItem(draftKey(working.workoutEntryId));
      onFinished();
    } catch {
      setError("Failed to finish workout.");
    }
  };

  const discardWorkout = async () => {
    setError(null);
    try {
      await client.delete(`/api/workout-sessions/${working.workoutEntryId}/discard`, { headers: authHeaders });
      await AsyncStorage.removeItem(draftKey(working.workoutEntryId));
      onFinished();
    } catch {
      setError("Discard failed (endpoint may not exist yet).");
    }
  };

  useEffect(() => {
    onSessionUpdated?.(working);
  }, [working, onSessionUpdated]);

  const formatRest = (secs: number | null | undefined) => {
    const total = Math.max(0, Number(secs ?? 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const baseIndex = working.exercises?.length ?? 0;

  const addExerciseToSession = async (exerciseId: number, orderIndex: number) => {
    if (!working?.workoutEntryId) return;

    try {
      setError(null);
      const res = await client.post(
        `/api/workout-sessions/${working.workoutEntryId}/add-exercise`,
        { exerciseId, orderIndex, targetSets: 3, targetReps: 10, restSeconds: 90 },
        { headers: authHeaders }
      );

      const added = res.data;
      setWorking((prev) => {
        const nextExercises = [...(prev.exercises ?? []), added].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );
        const next = { ...prev, exercises: nextExercises };
        onSessionUpdated?.(next);
        return next;
      });
    } catch (e) {
      console.error(e);
      setError("Failed to add exercise.");
    }
  };

  const existingIds = useMemo(() => (working.exercises ?? []).map((e) => e.exerciseId), [working.exercises]);

  const [pickerIds, setPickerIds] = useState<number[]>([]);
  useEffect(() => {
    if (chooseExerciseOpen) setPickerIds(existingIds);
  }, [chooseExerciseOpen, existingIds]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <ChevronLeft color="rgba(255,255,255,0.8)" size={18} />
        </TouchableOpacity>
        <Text style={styles.workoutName} numberOfLines={1}>
          {working.workoutName ?? "Workout"}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={finishWorkout}>
          <CheckCircle2 color="#000000" size={16} />
          <Text style={styles.btnPrimaryText}>Finish</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={discardWorkout}>
          <XCircle color="#ef4444" size={16} />
          <Text style={styles.btnDangerText}>Discard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalsRow}>
        <View style={styles.totalBox}>
          <Text style={styles.totalValue}>{totals.doneSets}</Text>
          <Text style={styles.totalLabel}>of {totals.totalSets} sets done</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalValue}>{Math.round(totals.volume)}</Text>
          <Text style={styles.totalLabel}>Volume</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalValue}>{(working.exercises || []).length}</Text>
          <Text style={styles.totalLabel}>Exercises</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={{ gap: 12, marginTop: 16 }}>
        {(working.exercises || []).map((ex: SessionExerciseDto) => {
          const isOpen = openExerciseIds.has(ex.workoutEntryExerciseId);
          const restForThisExercise = activeRestExerciseId === ex.workoutEntryExerciseId ? restLeft : null;
          const done = (ex.currentSets || []).filter((s: any) => s.completed).length;
          const total = (ex.currentSets || []).length;
          const isEditingRest = restEditForId === ex.workoutEntryExerciseId;

          return (
            <View key={ex.workoutEntryExerciseId} style={styles.exerciseBlock}>
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => toggleExerciseOpen(ex.workoutEntryExerciseId)}
              >
                <View>
                  <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                  <Text style={styles.exerciseProgress}>
                    {done}/{total} sets done
                  </Text>
                </View>
                <View style={styles.exerciseHeaderRight}>
                  {typeof restForThisExercise === "number" && (
                    <View style={styles.restTimerBadge}>
                      <Clock color="#d4af37" size={14} />
                      <Text style={styles.restTimerText}>{formatRest(restForThisExercise)}</Text>
                    </View>
                  )}
                  {isOpen ? (
                    <ChevronUp color="rgba(255,255,255,0.6)" size={18} />
                  ) : (
                    <ChevronDown color="rgba(255,255,255,0.6)" size={18} />
                  )}
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.exerciseBody}>
                  <View style={styles.restRow}>
                    {isEditingRest ? (
                      <>
                        <TextInput
                          style={styles.restInput}
                          keyboardType="numeric"
                          value={restDraftSeconds[ex.workoutEntryExerciseId] ?? String(ex.restSeconds ?? 0)}
                          onChangeText={(v) =>
                            setRestDraftSeconds((p) => ({ ...p, [ex.workoutEntryExerciseId]: v }))
                          }
                          placeholder="seconds"
                          placeholderTextColor="#71717a"
                        />
                        <TouchableOpacity
                          style={styles.btnSecondarySmall}
                          onPress={async () => {
                            const seconds = Number(restDraftSeconds[ex.workoutEntryExerciseId] ?? ex.restSeconds ?? 0);
                            await updateExercise(ex.workoutEntryExerciseId, { restSeconds: seconds });
                            setRestEditForId(null);
                          }}
                          disabled={savingNotesIds.has(ex.workoutEntryExerciseId)}
                        >
                          <Text style={styles.btnSecondarySmallText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRestEditForId(null)}>
                          <Text style={styles.cancelLink}>Cancel</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.restDisplayButton}
                        onPress={() => {
                          setRestEditForId(ex.workoutEntryExerciseId);
                          setRestDraftSeconds((p) => ({
                            ...p,
                            [ex.workoutEntryExerciseId]: String(ex.restSeconds ?? 0),
                          }));
                        }}
                      >
                        <Clock color="rgba(255,255,255,0.8)" size={14} />
                        <Text style={styles.restDisplayText}>Rest: {formatRest(ex.restSeconds)}s</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>Set</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Prev</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Weight</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Reps</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Done</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}></Text>
                  </View>

                  {(ex.currentSets || []).map((s: SessionSetDto, idx: number) => {
                    const setNo = s.setIndex ?? idx + 1;
                    const prevSet = (ex.previousSets ?? []).find((p) => p.setIndex === setNo);
                    const isSaving = savingSetIds.has(s.id);

                    return (
                      <View key={s.id} style={styles.setRow}>
                        <Text style={[styles.setCell, { flex: 0.6 }]}>{setNo}</Text>

                        <Text style={[styles.setCellMuted, { flex: 1.2 }]}>
                          {prevSet && prevSet.weight && prevSet.reps ? `${prevSet.weight} x ${prevSet.reps}` : "—"}
                        </Text>

                        <TextInput
                          style={[styles.setInput, { flex: 1 }]}
                          keyboardType="numeric"
                          value={s.weight != null ? String(s.weight) : ""}
                          placeholder="kg"
                          placeholderTextColor="#71717a"
                          onChangeText={(v) => updateLocalSet(s.id, { weight: v === "" ? null : Number(v) })}
                          onBlur={() => saveSetInBackend(s.id, { weight: s.weight ?? null })}
                        />

                        <TextInput
                          style={[styles.setInput, { flex: 1 }]}
                          keyboardType="numeric"
                          value={s.reps != null ? String(s.reps) : ""}
                          placeholder="reps"
                          placeholderTextColor="#71717a"
                          onChangeText={(v) => updateLocalSet(s.id, { reps: v === "" ? null : Number(v) })}
                          onBlur={() => saveSetInBackend(s.id, { reps: s.reps ?? null })}
                        />

                        <TouchableOpacity
                          style={[styles.doneButton, { flex: 0.7 }, s.completed && styles.doneButtonActive]}
                          disabled={isSaving}
                          onPress={async () => {
                            const nextCompleted = !s.completed;
                            updateLocalSet(s.id, { completed: nextCompleted });

                            if (nextCompleted) {
                              startRestTimer(ex.workoutEntryExerciseId, Number(ex.restSeconds ?? 0));
                            }

                            await saveSetInBackend(s.id, { completed: nextCompleted });
                          }}
                        >
                          <Check color={s.completed ? "#d4af37" : "rgba(255,255,255,0.4)"} size={16} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 0.6, alignItems: "center" }} onPress={() => deleteSet(s.id)}>
                          <Trash2 color="rgba(239,68,68,0.6)" size={16} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(ex.workoutEntryExerciseId)}>
                    <Plus color="rgba(255,255,255,0.8)" size={14} />
                    <Text style={styles.addSetText}>Add Set</Text>
                  </TouchableOpacity>

                  <View style={styles.notesRow}>
                    <TextInput
                      style={styles.notesInput}
                      value={notesByEx[ex.workoutEntryExerciseId] ?? ""}
                      onChangeText={(v) =>
                        setNotesByEx((prev) => ({ ...prev, [ex.workoutEntryExerciseId]: v }))
                      }
                      placeholder="Notes..."
                      placeholderTextColor="#71717a"
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.btnSecondarySmall}
                      onPress={() => saveNotes(ex.workoutEntryExerciseId)}
                      disabled={savingNotesIds.has(ex.workoutEntryExerciseId)}
                    >
                      <Save color="#e4e4e7" size={14} />
                      <Text style={styles.btnSecondarySmallText}>
                        {savingNotesIds.has(ex.workoutEntryExerciseId) ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addExerciseButton} onPress={() => setChooseExerciseOpen(true)}>
        <Plus color="#000000" size={16} />
        <Text style={styles.btnPrimaryText}>Add Exercise</Text>
      </TouchableOpacity>

      {chooseExerciseOpen && (
        <ChooseExercisesModal
          open={chooseExerciseOpen}
          onClose={() => setChooseExerciseOpen(false)}
          selectedIds={pickerIds}
          onSelectedIdsChange={setPickerIds}
          onConfirm={async ({ exercises }) => {
            const existing = new Set(existingIds);
            const newlyPicked = exercises.filter((ex) => !existing.has(ex.id));
            if (newlyPicked.length === 0) {
              setChooseExerciseOpen(false);
              return;
            }

            for (let i = 0; i < newlyPicked.length; i++) {
              await addExerciseToSession(newlyPicked[i].id, baseIndex + i);
            }
            setChooseExerciseOpen(false);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutName: {
    color: "#d4af37",
    fontSize: 20,
    fontWeight: "600",
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d4af37",
    borderRadius: 8,
    paddingVertical: 10,
    flex: 1,
  },
  btnPrimaryText: {
    color: "#000000",
    fontWeight: "600",
  },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 10,
    flex: 1,
  },
  btnDangerText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  totalsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 12,
  },
  totalBox: {
    flex: 1,
    alignItems: "center",
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  errorBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 13,
  },
  exerciseBlock: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.2)",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseProgress: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  exerciseHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  restTimerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  restTimerText: {
    color: "#d4af37",
    fontSize: 13,
    fontWeight: "600",
  },
  exerciseBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 10,
  },
  restRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  restDisplayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restDisplayText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  restInput: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 90,
  },
  btnSecondarySmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnSecondarySmallText: {
    color: "#e4e4e7",
    fontSize: 13,
  },
  cancelLink: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  tableHeader: {
    flexDirection: "row",
    marginTop: 4,
  },
  tableHeaderCell: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  setCell: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  setCellMuted: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
  },
  setInput: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 6,
    color: "#ffffff",
    textAlign: "center",
    paddingVertical: 6,
  },
  doneButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 8,
  },
  doneButtonActive: {
    borderColor: "#d4af37",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  addSetText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  notesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    color: "#e4e4e7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 40,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d4af37",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
});
