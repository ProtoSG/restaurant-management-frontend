import { forwardRef, type InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ error, ...props }, ref) => {
    return (
      <div>
        <label className="flex flex-col gap-2">
          <p>Número de mesa:</p>
          <input
            ref={ref}
            {...props}
            className={`border-2 rounded px-2 py-1 focus:outline-2 focus:outline-orange ${
              error ? 'border-red' : 'border-background'
            } ${props.className || ''}`}
          />
        </label>
        {error && <p className="text-red font-semibold text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
