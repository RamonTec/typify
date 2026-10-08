import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Code2, GitCompare, KeyRound, Workflow, type LucideIcon } from "lucide-react";
import { TOOL_CATALOG, type ToolId, type ToolMeta } from "./catalog";

export interface ToolDefinition extends ToolMeta {
    icon: LucideIcon;
    Component: LazyExoticComponent<ComponentType>;
}

const BINDINGS: Record<ToolId, Pick<ToolDefinition, "icon" | "Component">> = {
    generate: {
        icon: Code2,
        Component: lazy(() => import("./generate/GenerateTool").then((m) => ({ default: m.GenerateTool }))),
    },
    compare: {
        icon: GitCompare,
        Component: lazy(() => import("./compare/CompareTool").then((m) => ({ default: m.CompareTool }))),
    },
    jwt: {
        icon: KeyRound,
        Component: lazy(() => import("./jwt/JwtTool").then((m) => ({ default: m.JwtTool }))),
    },
    mermaid: {
        icon: Workflow,
        Component: lazy(() => import("./mermaid/MermaidTool").then((m) => ({ default: m.MermaidTool }))),
    },
};

export const TOOLS: readonly ToolDefinition[] = TOOL_CATALOG.map((meta) => ({ ...meta, ...BINDINGS[meta.id] }));
