import { BicepsFlexed } from "lucide-react";
import React, { useEffect } from "react";
import DialogBoxModal from "./DialogBoxModal";

interface Exercise {
    id: number;
    name: string;
    description: string;
    youtubeLink?: string;
    primaryMuscleGroup: string;
    secondaryMuscleGroup?: string;
    tertiaryMuscleGroup?: string;
}

interface ExerciseModalProps {
    exercise: Exercise,
    onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({exercise, onClose}) => {

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <DialogBoxModal
            open={true}
            onClose={onClose}
            title={exercise.name}
            icon={<BicepsFlexed/>}
            maxWidthClass="max-w-2xl"
        >
                {/* YouTube Video */}
                {exercise.youtubeLink && (
                    <div className="mb-4 aspect-video">
                        <iframe
                            width="100%"
                            height="315"
                            src={exercise.youtubeLink.replace("watch?v=","embed/")}
                            title={exercise.name}
                            className="rounded-lg"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Description */}
                {exercise.description && (
                    <div className="card-surface p-4 mb-6">
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="muted mb-2">{exercise.description}</p>
                    </div>
                )}
                

                <div className="flex flex-wrap gap-2 mb-8">
                    {[exercise.primaryMuscleGroup, exercise.secondaryMuscleGroup, exercise.tertiaryMuscleGroup]
                        .filter(Boolean)
                        .map((muscle, idx) => (
                            <span  
                                key={`${muscle}-${idx}`}
                                className="px-3 py-1 rounded-lg border border-brand-gold/70 bg-black/90 text-sm font-medium text-brand-gold"
                            >
                                {muscle}
                            </span>
                        )
                    )}
                </div>
                

                <div className="flex justify-end gap-x-3">
                    <button
                        onClick={onClose}
                        className="btn btn-danger"
                    >
                        Close
                    </button>

                <button className="btn btn-primary">
                    + Add to Workout
                </button>
                </div>

        </DialogBoxModal>
    );
};

export default ExerciseModal;