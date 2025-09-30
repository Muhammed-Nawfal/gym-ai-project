import { BicepsFlexed } from "lucide-react";
import React, { useEffect } from "react";

interface Exercise {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string;
  muscleGroups: string[];
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto bg-transparent/80 border-2 border-brand-gold/10 rounded-lg">
                
                <div className="flex items-center justify-left gap-3 text-2xl font-semibold mb-4 text-brand-gold">
                    <BicepsFlexed size={28}/>
                    {exercise.name}
                </div>

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
                <div className="border border-brand-goldDark/50 bg-black/90 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="muted mb-2">{exercise.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {exercise.muscleGroups.map((muscle, idx) => (
                        <span  
                            key={idx}
                            className="px-3 py-1 rounded-lg border border-brand-gold/70 bg-blac/90 text-sm font-medium text-brand-gold"
                        >
                            {muscle}
                        </span>
                    ))}
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

            </div>
        </div>
    );
};

export default ExerciseModal;