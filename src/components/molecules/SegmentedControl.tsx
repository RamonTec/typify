
import { cn } from "../../utils/cn";

interface Option {
    label: string;
    value: string;
}

interface SegmentedControlProps {
    options: Option[];
    value: string;
    onChange: (value: any) => void;
    className?: string;
}

export const SegmentedControl = ({
    options,
    value,
    onChange,
    className,
}: SegmentedControlProps) => {
    return (
        <div className={cn("flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1", className)}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex-1 rounded-md px-3 py-1 text-xs font-medium transition-all",
                            isActive
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};