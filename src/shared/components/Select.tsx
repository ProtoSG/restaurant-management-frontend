import { forwardRef, type SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ error, label, options, ...props }, ref) => {
    return (
      <div>
        <label className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground-dark tracking-wide">{label}</p>
          <select
            ref={ref}
            {...props}
            className={`border-2 rounded px-2 py-1 focus:outline-2 focus:outline-orange ${
              error ? 'border-red' : 'border-background'
            } ${props.className || ''}`}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="text-red font-semibold text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
