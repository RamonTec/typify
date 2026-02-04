import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) => {
    return (
        <div
            className={cn(
                "flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in zoom-in-95 duration-200",
                className
            )}
        >
            <div className="rounded-full bg-slate-100 p-4 ring-1 ring-slate-200">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <div className="max-w-xs space-y-1">
                <h3 className="text-lg font-medium text-slate-900">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};