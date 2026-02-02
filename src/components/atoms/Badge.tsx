import React from "react";
import { cn } from "../../utils/cn";

type BadgeVariant = "success" | "error" | "neutral" | "warning";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export const Badge = ({ className, variant = "neutral", ...props }: BadgeProps) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset transition-colors cursor-default";

    const variants = {
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        error: "bg-red-50 text-red-700 ring-red-600/10",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
        neutral: "bg-slate-50 text-slate-600 ring-slate-500/10",
    };

    return (
        <span className={cn(baseStyles, variants[variant], className)} {...props} />
    );
};