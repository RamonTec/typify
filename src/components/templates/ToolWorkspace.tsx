import React from "react";
import { cn } from "../../utils/cn";

interface ToolWorkspaceProps {
    input: React.ReactNode;
    output: React.ReactNode;
    className?: string;
}

export const ToolWorkspace = ({ input, output, className }: ToolWorkspaceProps) => {
    return (
        <div className={cn("flex min-h-0 flex-1 flex-col gap-4 sm:gap-6 md:flex-row", className)}>
            {input}
            {output}
        </div>
    );
};

type PanelVariant = "input" | "output";

interface ToolPanelProps {
    title: string;
    variant: PanelVariant;
    controls?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const ToolPanel = ({ title, variant, controls, actions, children, className }: ToolPanelProps) => {
    const isOutput = variant === "output";

    return (
        <section
            aria-label={title}
            className={cn(
                "flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl md:min-h-0",
                className
            )}
        >
            <div className={cn("flex h-full flex-col", isOutput && "bg-slate-50")}>
                <div
                    className={cn(
                        "z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-2",
                        isOutput ? "border-slate-200" : "border-slate-100"
                    )}
                >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="text-xs font-semibold uppercase text-slate-500">{title}</span>
                        {controls}
                    </div>
                    {actions && <div className="flex items-center gap-1">{actions}</div>}
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
            </div>
        </section>
    );
};

export const ToolOutputSkeleton = () => {
    return (
        <div className="flex h-full w-full flex-col bg-slate-50 p-4" aria-busy="true" aria-label="Calculando">
            <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200/50" />
                <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200/50" />
            </div>
            <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded-md bg-slate-200/50" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-200/50" />
                <div className="h-4 w-4/6 animate-pulse rounded-md bg-slate-200/50" />
                <div className="h-4 w-3/6 animate-pulse rounded-md bg-slate-200/50" />
            </div>
        </div>
    );
};

export const ToolWorkspaceSkeleton = () => {
    return (
        <ToolWorkspace
            input={<div className="flex-1 animate-pulse rounded-2xl bg-white/60 shadow-xl" />}
            output={<div className="flex-1 animate-pulse rounded-2xl bg-white/60 shadow-xl" />}
        />
    );
};
