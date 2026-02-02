import React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, id, ...props }, ref) => {
        const uniqueId = id || React.useId();

        return (
            <div className="flex items-center space-x-2">
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-slate-200 has-[:checked]:bg-indigo-600">
                    <input
                        id={uniqueId}
                        type="checkbox"
                        className="peer sr-only"
                        ref={ref}
                        {...props}
                    />
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out translate-x-1 peer-checked:translate-x-6" />
                </div>
                {label && (
                    <label htmlFor={uniqueId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer">
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Switch.displayName = "Switch";