import React from "react";

type StatsCardProps = {
  title: string;
  value: React.ReactNode;
  caption?: string;
  icon?: React.ReactNode;
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  caption, 
  icon, 
}) => {

  return (
    <div className="card p-7 card-hover card-hover-gold">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="muted text-sm">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
          {caption ? <div className="muted text-sm">{caption}</div> : null}
        </div>
        {icon ? <div className="opacity-80 self-center">{icon}</div> : null}
      </div>
    </div>
  );
};

export default StatsCard;