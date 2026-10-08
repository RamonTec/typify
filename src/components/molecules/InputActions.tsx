import { AlignLeft, Minimize2, Redo, Trash2, Undo } from "lucide-react";
import { Button } from "../atoms/Button";

interface InputActionsProps {
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onFormat?: () => void;
    onMinify?: () => void;
    onClear?: () => void;
}

const Separator = () => <div className="mx-1 h-4 w-px bg-slate-200" aria-hidden="true" />;

export const InputActions = ({
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onFormat,
    onMinify,
    onClear,
}: InputActionsProps) => {
    const hasHistory = Boolean(onUndo || onRedo);
    const hasFormatting = Boolean(onFormat || onMinify);

    return (
        <div className="flex items-center gap-1">
            {hasHistory && (
                <>
                    {onUndo && (
                        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer" title="Deshacer">
                            <Undo className="h-4 w-4 text-slate-600" />
                        </Button>
                    )}
                    {onRedo && (
                        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer" title="Rehacer">
                            <Redo className="h-4 w-4 text-slate-600" />
                        </Button>
                    )}
                    <Separator />
                </>
            )}

            {hasFormatting && (
                <>
                    {onFormat && (
                        <Button variant="ghost" size="icon" onClick={onFormat} aria-label="Formatear" title="Formatear">
                            <AlignLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                    )}
                    {onMinify && (
                        <Button variant="ghost" size="icon" onClick={onMinify} aria-label="Minificar" title="Minificar">
                            <Minimize2 className="h-4 w-4 text-slate-600" />
                        </Button>
                    )}
                    <Separator />
                </>
            )}

            {onClear && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Limpiar"
                    title="Limpiar"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
