import { Suspense, type ComponentType } from "react";
import { cn } from "../../utils/cn";
import type { ToolId } from "../../tools/catalog";
import { ToolWorkspaceSkeleton } from "../templates/ToolWorkspace";

interface ToolHostItem {
    id: ToolId;
    Component: ComponentType;
}

interface ToolHostProps {
    tools: readonly ToolHostItem[];
    activeId: ToolId;
    mountedIds: readonly ToolId[];
}

export const ToolHost = ({ tools, activeId, mountedIds }: ToolHostProps) => {
    return (
        <>
            {tools
                .filter((tool) => mountedIds.includes(tool.id))
                .map(({ id, Component }) => (
                    <div key={id} className={cn("flex min-h-0 flex-1 flex-col", id !== activeId && "hidden")}>
                        <Suspense fallback={<ToolWorkspaceSkeleton />}>
                            <Component />
                        </Suspense>
                    </div>
                ))}
        </>
    );
};
