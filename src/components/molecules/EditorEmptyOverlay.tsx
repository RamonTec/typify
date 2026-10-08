import type { LucideIcon } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { PasteButton } from "./PasteButton";

interface EditorEmptyOverlayProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onPaste: (text: string) => void;
}

export const EditorEmptyOverlay = ({ icon, title, description, onPaste }: EditorEmptyOverlayProps) => {
    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <div className="pointer-events-auto">
                <EmptyState
                    icon={icon}
                    title={title}
                    description={description}
                    action={<PasteButton onPaste={onPaste} />}
                />
            </div>
        </div>
    );
};
