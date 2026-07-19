import type { LucideIcon } from "lucide-react";
import React from "react";

type WorkoutAndExerciseCardProps = {
  title: string;
  description?: string | null;
  icon?: React.ReactNode;
  badges?: string[];
  onClick?: () => void;
//   rightSlot?: React.ReactNode;
};

const WorkoutAndExerciseCard: React.FC<WorkoutAndExerciseCardProps> =({
    title,
    description,
    icon,
    badges = [],
    onClick,
}) => {
    return(
        <div
            onClick={onClick}
            className="card card-hover card-hover-gold p-5 flex flex-col cursor-pointer relative h-full"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
            </div>
            <p className="muted mb-6 line-clamp-1">
                    {description || "No description"}
            </p>

            {badges.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2">
                    {badges.map((b,idx)=> (
                        <span
                            key={`${b}-${idx}`}
                            className="px-3 py-2 rounded-md text-xs bg-black/30 border border-brand-goldDark text-brand-gold"
                        >
                            {b}
                        </span>
                    ))}
                    </div>
            )}
        </div>
    );
};

export default WorkoutAndExerciseCard;