import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react"; // optional icons

interface DropDownTextFieldOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropDownTextFieldOption[];
  editable?: boolean;
  multiSelect?: false;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: DropDownTextFieldOption[];
  editable?: boolean;
  multiSelect: true;
}

type DropDownTextFieldProps = SingleSelectProps | MultiSelectProps;

const DropDownTextField: React.FC<DropDownTextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  editable = true,
  multiSelect= false,
}) => {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm text-gray-200">{label}</label>}

      <Listbox 
        value={value} 
        onChange={onChange as any} 
        disabled={!editable}
        multiple={multiSelect}
      >
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
            {multiSelect ? (
              (value as string[]).length>0
                ? (value as string[])
                  .map((v)=> options.find((o) => o.value ===v)?.label)
                  .join(",")
                : placeholder || "Select options"
            ) : (
              options.find((o) => o.value === (value as string))?.label || placeholder || "Select an option"
            )}
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
