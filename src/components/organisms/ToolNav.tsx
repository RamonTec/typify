import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ToolId } from "../../tools/catalog";

interface ToolNavItem {
    id: ToolId;
    label: string;
    description: string;
    icon: LucideIcon;
}

interface ToolNavProps {
    tools: readonly ToolNavItem[];
    activeId: ToolId;
    onSelect: (id: ToolId) => void;
    className?: string;
}

export const ToolNav = ({ tools, activeId, onSelect, className }: ToolNavProps) => {
    const activeTool = tools.find((tool) => tool.id === activeId);

    return (
        <nav aria-label="Herramientas" className={className}>
            <ul className="hidden flex-col gap-1 rounded-2xl border border-white/20 bg-white/60 p-2 shadow-xl backdrop-blur-md md:flex">
                {tools.map((tool) => {
                    const isActive = tool.id === activeId;
                    const Icon = tool.icon;
                    return (
                        <li key={tool.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(tool.id)}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
                                    isActive
                                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                        : "text-slate-700 hover:bg-white/80 hover:text-slate-900"
                                )}
                            >
                                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium">{tool.label}</span>
                                    <span className="text-xs leading-snug text-slate-500">{tool.description}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="flex flex-col gap-1 md:hidden">
                <label htmlFor="tool-select" className="sr-only">
                    Herramienta
                </label>
                <select
                    id="tool-select"
                    value={activeId}
                    onChange={(event) => onSelect(event.target.value as ToolId)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                    {tools.map((tool) => (
                        <option key={tool.id} value={tool.id}>
                            {tool.label}
                        </option>
                    ))}
                </select>
                {activeTool && <p className="px-1 text-xs text-slate-500">{activeTool.description}</p>}
            </div>
        </nav>
    );
};
