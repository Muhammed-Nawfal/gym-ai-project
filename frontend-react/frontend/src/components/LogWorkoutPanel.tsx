import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SessionExerciseDto, SessionSetDto, StartWorkoutResponse } from "../api/types";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Plus, Save, Trash2, XCircle } from "lucide-react";
import ChooseExercisesModal from "./ChooseExercisesModal";

type LogWorkoutPanelProps = {
    session: StartWorkoutResponse;
    onClose: () => void;
    onSessionUpdated?: (s:StartWorkoutResponse) => void;
    onFinished: () => void;
}

type UpdateSetPayload = {
    weight?: number | null;
    reps?: number | null;
    completed? : boolean;
}

type UpdateExercisePayload = {
    notes?: string;
    restSeconds? : number;
    orderIndex? : number;
}

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

type RestDraftParts = { m: number; s: number };


const LS_KEY = (workoutEntryId: number) =>`gym_ai_active_session_draft:${workoutEntryId}`;

export default function LogWorkoutPanel( {session, onClose, onSessionUpdated, onFinished,} : LogWorkoutPanelProps ){

    const {token} = useAuth();
    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${token}` }),
        [token]
    );

    const [working, setWorking] = useState<StartWorkoutResponse>(session);

    const [notesByEx, setNotesByEx] = useState<Record<number, string>>(() =>{
        const init : Record<number,string> = {};

        (session.exercises ?? []).forEach((ex: SessionExerciseDto) => {
            init[ex.workoutEntryExerciseId] = ex.notes ?? "";
        });
        return init;
    });

    const [openExerciseIds, setOpenExerciseIds] = useState<Set<number>>(
        () => new Set()
    );

    const [activeRestExerciseId, setActiveRestExerciseId] = useState<number | null>(null);
    const [restLeft, setRestLeft] = useState<number | null>(null);
    const restIntervalRef = useRef<any>(null);

    const [savingSetIds, setSavingSetIds] = useState<Set<number>>(new Set());
    const [savingNotesIds, setSavingNotesIds] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const [restEditForId, setRestEditForId] = useState<number | null>(null);
    const [restDraftParts, setRestDraftParts] = useState<Record<number, RestDraftParts>>({});

    const [chooseExerciseOpen, setChooseExerciseOpen] = useState(false);

    useEffect(() => {
        setWorking(session);
    },[session]);

    //loading offline draft from local storage and copying it to the current workout session
    useEffect(() => {
        try{
            const raw = localStorage.getItem(LS_KEY(session.workoutEntryId));
            if(!raw) return;
            const draft: SessionDraft = JSON.parse(raw);

            if (draft.notes) {
                setNotesByEx((prev) => ({ ...prev, ...draft.notes }));
            }

            if(draft.exercises) {            
                setWorking((prev) => ({
                    ...prev,
                    exercises: (prev.exercises ?? [])  //copying prev and changing exercises alone
                        .map((ex) => {
                            const draftEx = draft.exercises?.[String(ex.workoutEntryExerciseId)]; //uses the ex id from the prev state of the workout session 
                            if(!draftEx) return ex;

                            const nextSets = (ex.currentSets ?? [])
                                .map((s) => {
                                    const draftSets = draftEx.sets?.[String(s.id)];
                                    if(!draftSets) return s;

                                    return {
                                        ...s,
                                        weight: draftSets.weight ?? s.weight,
                                        reps: draftSets.reps ?? s.reps,
                                        completed:
                                            typeof draftSets.completed === "boolean" ? draftSets.completed : s.completed,
                                    };
                                });

                            return { ...ex, currentSets: nextSets };
                        }),
                }));
            }
        } catch {}
    }, [session.workoutEntryId]);

    //saving the data to localstorage whenever changes happen in the front-end
    useEffect(() => {
        const t = setTimeout(() => {
            try{
                const draft : SessionDraft = { notes: notesByEx, exercises: {}};
                (working.exercises ?? []).forEach((ex: SessionExerciseDto) => {
                    draft.exercises![String(ex.workoutEntryExerciseId)] = {
                        sets: Object.fromEntries(
                            (ex.currentSets ?? []).map((s : SessionSetDto) => [
                                String(s.id),
                                { weight: s.weight, reps: s.reps, completed: s.completed },
                            ])
                        ),
                    };
                });
                localStorage.setItem(LS_KEY(working.workoutEntryId), JSON.stringify(draft));
            } catch{}
        }, 300);
        
        return () => clearTimeout(t);
    }, [working, notesByEx])

    //cleaning up of data stored by useRef in the background
    useEffect(() => {
        return () => { //returning means clean-up
            if(restIntervalRef.current) clearInterval(restIntervalRef.current);
            restIntervalRef.current = null;
        };
    }, []);

    const totals = useMemo(() => {

        let totalSets = 0;
        let doneSets = 0;
        let volume = 0;

        (working.exercises ?? []).forEach((ex : SessionExerciseDto) => {
            (ex.currentSets ?? []).forEach((s : SessionSetDto) => {
                totalSets += 1;
                if(s.completed){
                    doneSets += 1;
                    volume += Number(s.weight ?? 0) * Number(s.reps ?? 0);
                }
            });
        });

        return { totalSets, doneSets, volume};

    }, [working]);

    const toggleExerciseOpen = (workoutEntryExerciseId : number) => {
        setOpenExerciseIds((prev) => {
            const next = new Set(prev);
            next.has(workoutEntryExerciseId)
                ? next.delete(workoutEntryExerciseId)
                : next.add(workoutEntryExerciseId);

            return next;
        });
    };

    const startRestTimer = (workoutEntryExerciseId: number, seconds: number) => {
        if(!seconds || seconds<=0) return;

        if (restIntervalRef.current) clearInterval(restIntervalRef.current);

        setActiveRestExerciseId(workoutEntryExerciseId);
        setRestLeft(seconds);

        restIntervalRef.current = setInterval(() => {
            setRestLeft((prev) => {
                if(prev == null) return null;

                if(prev <=1){
                    clearInterval(restIntervalRef.current);
                    restIntervalRef.current = null;
                    setActiveRestExerciseId(null);
                    return null;
                }

                return prev -1;
            });
        }, 1000);
    };

    const updateLocalSet = (setId: number, patch: UpdateSetPayload) => {
        setWorking((prev) => {
            const next: StartWorkoutResponse = {...prev};
            next.exercises = (prev.exercises ?? []).map((ex:SessionExerciseDto) => {
                const nextSets = (ex.currentSets ?? []).map((s:SessionSetDto)=>
                    s.id ===setId ? {...s, ...patch} : s
                );

                return {...ex, currentSets:nextSets};
                });
                return next;
            });
    };

    const saveSetInBackend = async (setId:number, payload: UpdateSetPayload) => {
        setError(null);
        setSavingSetIds((prev) => new Set(prev).add(setId));

        try{
            const res = await axios.put(
                `/api/workout-sessions/${setId}/update-set`,
                payload,
                { headers: authHeaders }
            );

            const updated : SessionSetDto = res.data;

            updateLocalSet(setId, {
                weight: updated.weight ?? null,
                reps: updated.reps ?? null,
                completed: updated.completed,
            });
        } 
        catch{
            setError("Failed to save set. Try again.");
        }

        finally{
            setSavingSetIds((prev) => {
                const next = new Set(prev);
                next.delete(setId);
                return next;
            });
        }
    };

    const addSet = async (workoutEntryExerciseId: number) => {
        setError(null);

        try{
            const res = await axios.post(
                `/api/workout-sessions/${workoutEntryExerciseId}/add-set`,
                null,
                { headers : authHeaders }
            );

            const newSet = res.data;

            setWorking((prev) => ({
                ...prev,
                exercises: prev.exercises.map((ex) =>
                    ex.workoutEntryExerciseId === workoutEntryExerciseId ? {...ex, currentSets : [...(ex.currentSets ?? []), newSet]} : ex
                ),
            }));
        } catch{
            setError("Failed to add set.");
        }
    };

    const deleteSet = async (setId:number) => {
        setError(null);

        try{
            await axios.delete(`/api/workout-sessions/${setId}/delete-set`,
                {headers: authHeaders}
            );

            setWorking((prev) => {
                const next: StartWorkoutResponse = {...prev};
                next.exercises = (prev.exercises ?? []).map((ex : SessionExerciseDto) => ({
                    ...ex,
                    currentSets: (ex.currentSets ?? []).filter((s:SessionSetDto) => s.id !==setId),
                }));

                return next;
            });
        }
        catch{
            setError("Failed to delete set.");
        }
    };

    const updateExercise = async (workoutEntryExId: number, patch: UpdateExercisePayload) => {
        setError(null);

        setSavingNotesIds((prev) => new Set(prev).add(workoutEntryExId));

        try{
            const res = await axios.put(
                `/api/workout-sessions/exercises/${workoutEntryExId}`,
                patch,
                { headers: authHeaders }
            );

            const updated: SessionExerciseDto = res.data

            setWorking((prev) => {
                const next: StartWorkoutResponse = {...prev};
                next.exercises = prev.exercises.map((ex) => ex.workoutEntryExerciseId === workoutEntryExId ? updated : ex);
                return next;
            });

            if(typeof updated.notes === "string"){
                setNotesByEx((prev) => ({...prev, [workoutEntryExId] : updated.notes!}))
            }
        }
        catch {
            setError("Failed to update exercise.");
        } 
        finally{
            setSavingNotesIds((prev) => {
                const next = new Set(prev);
                next.delete(workoutEntryExId);
                return next;
            });
        }
    };

    const saveNotes = async(workoutEntryExId: number) => {
        const notes = (notesByEx[workoutEntryExId] ?? "").trim();
        await updateExercise(workoutEntryExId, {notes});
    }

    const finishWorkout = async () => {
        setError(null);

        try{
            await axios.post(
                `/api/workout-sessions/${working.workoutEntryId}/finish-workout`,
                null,
                { headers: authHeaders }
            );
            localStorage.removeItem(LS_KEY(working.workoutEntryId));
            onFinished();
        }   
        catch {
            setError("Failed to finish workout.");
        }
    };

      const discardWorkout = async () => {
        setError(null);
        try {
            await axios.delete(
                `/api/workout-sessions/${working.workoutEntryId}/discard`,
                { headers: authHeaders }
            );
            localStorage.removeItem(LS_KEY(working.workoutEntryId));
            onFinished();
        } catch {
            setError("Discard failed (endpoint may not exist yet).");
        }
    };

    // const focusNext = (current: HTMLInputElement | null) => {
    //     if(!current) return;

    //     const root = current.closest("[data-exercise-block='true']");
    //     if(!root) return;
    //     const inputs = Array.from(root.querySelectorAll("input[data-set-input='true']")) as HTMLInputElement[];
    //     const idx = inputs.indexOf(current);
    //     const next = inputs[idx +1];
    //     if(next) next.focus();
    // };

    useEffect(() => {
        onSessionUpdated?.(working);
    }, [working, onSessionUpdated]      
    );


    const parseRestToSeconds = (input: string): number | null => {
        const t = input.trim();
        if (!t) return null;

        if (!t.includes(":")) {
            const seconds = Number(t);
            if (!Number.isFinite(seconds) || seconds < 0) return null;
            return Math.floor(seconds);
        }

        const [mm, ss] = t.split(":");
        const m = Number(mm);
        const s = Number(ss);

        if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
        if (m < 0 || s < 0 || s >= 60) return null;

        return Math.floor(m) * 60 + Math.floor(s);
    };

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    const toParts = (secs: number | null | undefined): RestDraftParts => {
        const total = Math.max(0, Number(secs ?? 0));
        return { m: Math.floor(total / 60), s: total % 60 };
    };

    const toSeconds = (p: RestDraftParts) => clamp(p.m, 0, 99) * 60 + clamp(p.s, 0, 59);

    const formatRest = (secs: number | null | undefined) => {
        const {m,s} = toParts(secs);
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const baseIndex = (working.exercises?.length ?? 0);

    const addExerciseToSession = async (exerciseId: number, orderIndex: number) => {
        if (!working?.workoutEntryId) return;

        try {
            setError(null);

            const res = await axios.post(
            `/api/workout-sessions/${working.workoutEntryId}/add-exercise`,
            {
                exerciseId,
                orderIndex: orderIndex,
                targetSets: 3,
                targetReps: 10,
                restSeconds: 90,
            },
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

    const existingIds = useMemo(
        () => (working.exercises ?? []).map((e) => e.exerciseId),
        [working.exercises]
    );

    const [pickerIds, setPickerIds] = useState<number[]>([]);
        useEffect(() => {
        if (chooseExerciseOpen) setPickerIds(existingIds);
    }, [chooseExerciseOpen, existingIds]);

    

    return (
        <section className="w-full max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="p-6">

                    {/* Part above exercise */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                                <button
                                    onClick={onClose}
                                    className="rounded-xl border border-white/10 bg-black/30 p-2 hover:border-brand-gold/40"
                                    title="Back"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white/80" />
                                </button>

                                <div className="min-w-0">

                                    <h2 className="h2 text-2xl text-brand-gold truncate">
                                        {working.workoutName ?? "Workout"}
                                    </h2>

                                </div>

                                
                        </div>

                        <div className="flex gap-2 w-full max-w-sm">
                            <button
                                onClick={finishWorkout}
                                className="btn btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Finish
                            </button>

                            <button
                                onClick={discardWorkout}
                                className="btn btn-danger flex-1 h-10 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Discard
                            </button>
                        </div>

                    </div>

                    <div className="mt-6">
                        <div className="grid grid-cols-3 divide-x divide-white/10">

                            <div className="px-6 py-4 text-center">
                                <p className="text-2xl font-semibold leading-none">
                                    {totals.doneSets}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
                                    of {totals.totalSets} sets Done
                                </p>
                            </div>

                            <div className="px-6 py-4 text-center">
                                <p className="text-2xl font-semibold leading-none">
                                    {Math.round(totals.volume)}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
                                    Volume
                                </p>
                            </div>

                            <div className="px-6 py-4 text-center">
                                <p className="text-2xl font-semibold leading-none">
                                    {(working.exercises || []).length}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
                                    Exercises
                                </p>
                            </div>

                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                        {error}
                        </div>
                    )}

                    {/* exercises */}
                        <div className="mt-6 space-y-4">
                            {(working.exercises || []).map((ex: SessionExerciseDto) => {
                                const isOpen = openExerciseIds.has(ex.workoutEntryExerciseId);
                                const restConfig = Number(ex.restSeconds ?? 0);
                                const restForThisExercise = activeRestExerciseId === ex.workoutEntryExerciseId ? restLeft : null;
                                const done = (ex.currentSets || []).filter((s: any) => s.completed).length;
                                const total = (ex.currentSets || []).length;

                                return (
                                    <div
                                        key={ex.workoutEntryExerciseId}
                                        className="border-l border-white/20 hover:border-brand-gold/40 transition"

                                    >
                                        <button
                                            onClick={() => toggleExerciseOpen(ex.workoutEntryExerciseId)}
                                            className="w-full px-5 py-4 flex items-center justify-between gap-4"
                                        >
                                            <div className="text-left">
                                                <p className="text-lg font-semibold">{ex.exerciseName}</p>
                                                <p className="text-xs text-white/60 mt-1">
                                                    {done}/{total} sets done
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {typeof restForThisExercise === "number" && (
                                                    <div className="flex items-center gap-2 text-brand-gold">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">{formatRest(restForThisExercise)}s</span>
                                                    </div>
                                                )}
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-white/60"/>
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-white/60"/>
                                                )}
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 pb-5" data-exercise-block="true">

                                                <div className="mt-3 mb-4 flex items-center gap-3">
                                                    {restEditForId === ex.workoutEntryExerciseId ? (
                                                        <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-white/60">Rest : </span>

                                                            <select
                                                            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-brand-gold/60"
                                                            value={(restDraftParts[ex.workoutEntryExerciseId]?.m ?? toParts(ex.restSeconds).m)}
                                                            onChange={(e) => {
                                                                const m = Number(e.target.value);
                                                                setRestDraftParts((p) => ({
                                                                    ...p,
                                                                    [ex.workoutEntryExerciseId]: {
                                                                        m,
                                                                        s: p[ex.workoutEntryExerciseId]?.s ?? toParts(ex.restSeconds).s,
                                                                    },
                                                                }));
                                                            }}
                                                            >
                                                            {Array.from({ length: 10 }, (_, i) => i).map((m) => (
                                                                <option key={m} value={m}>
                                                                    {m} mins
                                                                </option>
                                                            ))}
                                                            </select>

                                                            {/* Seconds */}
                                                            <select
                                                            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-brand-gold/60"
                                                            value={(restDraftParts[ex.workoutEntryExerciseId]?.s ?? toParts(ex.restSeconds).s)}
                                                            onChange={(e) => {
                                                                const s = Number(e.target.value);
                                                                setRestDraftParts((p) => ({
                                                                ...p,
                                                                [ex.workoutEntryExerciseId]: {
                                                                    m: p[ex.workoutEntryExerciseId]?.m ?? toParts(ex.restSeconds).m,
                                                                    s,
                                                                },
                                                                }));
                                                            }}
                                                            >
                                                            {Array.from({ length: 60 }, (_, i) => i).map((s) => (
                                                                <option key={s} value={s}>
                                                                {s} secs
                                                                </option>
                                                            ))}
                                                            </select>
                                                        </div>

                                                        <button
                                                            className="btn btn-secondary text-sm px-3 py-1"
                                                            onClick={async () => {
                                                                const parts = restDraftParts[ex.workoutEntryExerciseId] ?? toParts(ex.restSeconds);
                                                                await updateExercise(ex.workoutEntryExerciseId, { restSeconds: toSeconds(parts) });
                                                                setRestEditForId(null);
                                                            }}
                                                            disabled={savingNotesIds.has(ex.workoutEntryExerciseId)}
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            className="text-sm text-white/60 hover:text-white"
                                                            onClick={() => setRestEditForId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:border-brand-gold/50"
                                                        onClick={() => {
                                                            setRestEditForId(ex.workoutEntryExerciseId);
                                                            setRestDraftParts((p) => ({
                                                                ...p,
                                                                [ex.workoutEntryExerciseId]: toParts(ex.restSeconds),
                                                            }));
                                                        }}
                                                        title="Change rest time"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                            Rest: {formatRest(ex.restSeconds)}
                                                        </button>
                                                    )}
                                                </div>


                                                {/* Table header */}
                                                <div className="mt-4 grid grid-cols-9 gap-3 text-xs text-white/60 px-2 ">
                                                    <div className="col-span-1 flex justify-center">Set</div>
                                                    <div className="col-span-2 flex justify-center">Previously</div>
                                                    <div className="col-span-2 flex justify-center">Weight</div>
                                                    <div className="col-span-2 flex justify-center">Reps</div>
                                                    <div className="col-span-1 flex justify-center">Done</div>
                                                    <div className="col-span-1 text-right">Actions</div>
                                                </div>

                                                {/* Rows */}
                                                <div className="mt-2 space-y-2">
                                                    {(ex.currentSets || []).map((s: SessionSetDto, idx: number) => {
                                                        const setNo = s.setIndex ?? idx + 1;
                                                        const prevSet = (ex.previousSets ?? []).find((p) => p.setIndex === setNo);
                                                        const isSaving = savingSetIds.has(s.id);

                                                    return (
                                                        <div
                                                            key={s.id}
                                                            className="grid grid-cols-9 gap-3 items-center bg-black/25 px-2 py-2"
                                                        >
                                                            <div className="col-span-1 text-sm font-semibold flex justify-center">
                                                                {setNo}
                                                            </div>

                                                            <div className="col-span-2 text-sm text-white/60 flex justify-center">
                                                                {prevSet && prevSet.weight && prevSet.reps ? (
                                                                <span className="inline-flex rounded-lg border border-white/10 bg-black/30 px-2 py-1">
                                                                    {(prevSet.weight ?? 0) ? `${prevSet.weight}` : "—"} × {(prevSet.reps ?? 0) ? prevSet.reps : "—"}
                                                                </span>
                                                                ) : (
                                                                <span className="text-white/30">—</span>
                                                                )}
                                                            </div>

                                                            <div className="col-span-2 flex justify-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    inputMode="numeric"
                                                                    className="w-full max-w-[110px] bg-black/40 px-3 py-2 text-sm text-center outline-none focus:border-b border-brand-gold/60 no-spinner"
                                                                    value={s.weight ?? ""}
                                                                    placeholder="kg"
                                                                    onChange={(e) => {
                                                                        const val =
                                                                        e.target.value === "" ? null : Number(e.target.value);
                                                                        updateLocalSet(s.id, {
                                                                        weight: Number.isFinite(val as any) ? val : null,
                                                                        });
                                                                    }}
                                                                    onBlur={() => saveSetInBackend(s.id, { weight: s.weight ?? null })}
                                                                />
                                                            </div>

                                                            <div className="col-span-2 flex justify-center">
                                                                <input
                                                                type="number"
                                                                min={0}
                                                                inputMode="numeric"
                                                                className="w-full max-w-[110px] bg-black/40 px-3 py-2 text-sm text-center outline-none focus:border-b border-brand-gold/60 no-spinner"
                                                                value={s.reps ?? ""}
                                                                placeholder="reps"
                                                                onChange={(e) => {
                                                                    const val =
                                                                    e.target.value === "" ? null : Number(e.target.value);
                                                                    updateLocalSet(s.id, {
                                                                        reps: Number.isFinite(val as any) ? val : null,
                                                                    });
                                                                }}
                                                                onBlur={() => saveSetInBackend(s.id, { reps: s.reps ?? null })}
                                                                />
                                                            </div>

                                                            <div className="col-span-1 flex justify-center">
                                                                <button
                                                                className={`w-full rounded-lg px-3 py-2 text-sm border transition ${
                                                                    s.completed
                                                                    ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                                                                    : "border-white/10 bg-black/30 text-white/80 hover:border-brand-gold/50"
                                                                }`}
                                                                onClick={async () => {
                                                                    const nextCompleted = !s.completed;
                                                                    updateLocalSet(s.id, { completed: nextCompleted });

                                                                    if (nextCompleted) {
                                                                    startRestTimer(
                                                                        ex.workoutEntryExerciseId,
                                                                        Number(ex.restSeconds ?? 0)
                                                                    );
                                                                    }

                                                                    await saveSetInBackend(s.id, { completed: nextCompleted });
                                                                }}
                                                                disabled={isSaving}
                                                                >
                                                                {isSaving ? (
                                                                    "..." 
                                                                ) : s.completed ? (
                                                                    <Check className="mx-auto h-4 w-4 text-brand-gold" />
                                                                ) : (
                                                                    <Check className="mx-auto h-4 w-4 text-muted" />
                                                                )
                                                                }
                                                                </button>
                                                            </div>

                                                            <div className="col-span-1 flex items-center justify-end gap-2">
                                                                <button
                                                                className="rounded-lg border border-red-400/30 bg-black/30 p-2 hover:border-red-500"
                                                                onClick={() => deleteSet(s.id)}
                                                                title="Delete set"
                                                                >
                                                                <Trash2 className="w-4 h-4 text-red-500/50" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                    })}
                                                </div>



                                            <div className="mt-2 px-0 flex items-center justify-between">
                                                <button
                                                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
                                                onClick={() => addSet(ex.workoutEntryExerciseId)}
                                                >
                                                <Plus className="w-4 h-4" />
                                                Add Set
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-strech gap-3">
                                                        <textarea
                                                            value={notesByEx[ex.workoutEntryExerciseId] ?? ""}
                                                            onChange={(e) =>
                                                                setNotesByEx((prev) => ({
                                                                    ...prev,
                                                                    [ex.workoutEntryExerciseId]: e.target.value,
                                                                }))
                                                            }
                                                            className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-brand-gold/40"
                                                            rows={1}
                                                            placeholder="Notes..."
                                                        />

                                                        <button
                                                            onClick={() => saveNotes(ex.workoutEntryExerciseId)}
                                                            className="btn btn-secondary h-full px-5"
                                                            disabled={savingNotesIds.has(ex.workoutEntryExerciseId)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Save className="w-4 h-4" />
                                                                {savingNotesIds.has(ex.workoutEntryExerciseId)
                                                                    ? "Saving..."
                                                                    : "Save"}
                                                            </div>
                                                        </button>

                                            </div>
                                        </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                    <button
                        onClick={() => setChooseExerciseOpen(true)}
                        className="mt-6 w-full btn btn-primary flex h-10 items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Exercise
                    </button>

                    

                 </div>
            </div> 

              {chooseExerciseOpen && (
                <ChooseExercisesModal
                    open={chooseExerciseOpen}
                    onClose={() => setChooseExerciseOpen(false)}
                    selectedIds={pickerIds}
                    onSelectedIdsChange={setPickerIds}
                    onConfirm={async ({ ids, exercises }) => {
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
        </section>
    );
}