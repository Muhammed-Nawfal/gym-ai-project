import React from "react";

interface TextFieldProps {
  label?: string; // made optional
  placeholder?: string; // new prop for login-style fields
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editable?: boolean;
  type?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  editable = false,
  type = "text",
}) => {
  return (
    <div className="flex flex-col space-y-1">
      {/* Only render label if provided */}
      {label && <label className="text-sm text-zinc-400">{label}</label>}

      <input
        type={type === 'date' && !value ? "text" :type}
        value={value}
        onChange={onChange}
        readOnly={!editable}
        placeholder={placeholder}
        onFocus={(e)=> {
          if(type === "date") e.target.type = "date";
        }}
        onBlur={(e)=>{
          if(type === "date" && !value) e.target.type ="text";
        }}
        className={`
          muted w-full rounded-md px-3 py-2 bg-transparent
          border border-brand-gold/10
          ${editable
            ? "hover:border-brand-gold focus:border-brand-gold"
            : "hover:border-brand-goldDark cursor-default"}
          outline-none transition-colors
        `}
      />
    </div>
  );
};

export default TextField;
