import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react"; // optional icons

interface DropDownTextFieldOption {
  value: string;
  label: string;
}

interface DropDownTextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  options: DropDownTextFieldOption[];
  editable?: boolean;
}

const DropDownTextField: React.FC<DropDownTextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  editable = true,
}) => {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm text-zinc-400">{label}</label>}

      <Listbox value={value} onChange={onChange} disabled={!editable}>
        <div className="relative">
          <Listbox.Button
            className={`
              muted w-full rounded-md px-3 py-2 text-left
              bg-transparent border border-brand-gold/10
              ${editable
                ? "hover:border-brand-gold focus:border-brand-gold"
                : "hover:border-brand-goldDark cursor-default"}
              outline-none transition-colors
              flex justify-between items-center
            `}
          >
            {selected ? selected.label : placeholder || "Select an option"}
            <ChevronDown className="h-4 w-4 muted" />
          </Listbox.Button>

          <Listbox.Options
            className="
              absolute mt-1 w-full rounded-md bg-neutral-900 shadow-lg border border-brand-gold/10
              focus:outline-none z-10
            "
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) => `
                  cursor-pointer select-none px-3 py-2
                  ${active ? "bg-brand-gold/10 text-brand-gold" : "muted"}
                  ${selected ? "bg-brand-gold/20 text-brand-gold" : ""}
                `}
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    {option.label}
                    {selected && <Check className="h-4 w-4 text-brand-gold" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default DropDownTextField;
