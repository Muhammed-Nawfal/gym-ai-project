import React from "react";

type QuickActionItemProps = {
  title: string;
  description: string;
  onClick?: () => void;
};

const QuickActionItem: React.FC<QuickActionItemProps> = ({ title, description, onClick }) => {
  return (
    <button
      type="button"
      className="btn-list flex flex-col items-start gap-1"
      onClick={onClick}
    >
      <div className="h2">{title}</div>
      <div className="muted text-sm">{description}</div>
    </button>
  );
};

export default QuickActionItem;
