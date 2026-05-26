
import { cn } from "../../utils/cn";
import { type LucideIcon } from "lucide-react";

interface Option {
    label: string;
    value: string;
    icon?: LucideIcon;
}

interface SegmentedControlProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
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
                const Icon = option.icon;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
                            isActive
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};