import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import { Button } from "../atoms/Button";

interface PasteButtonProps {
    onPaste: (text: string) => void;
}

const CLIPBOARD_DENIED = "No se pudo leer el portapapeles. Pega el contenido con Ctrl+V (Cmd+V en Mac).";

export const PasteButton = ({ onPaste }: PasteButtonProps) => {
    const [error, setError] = useState<string | null>(null);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setError(null);
            onPaste(text);
        } catch {
            setError(CLIPBOARD_DENIED);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <Button onClick={handlePaste} variant="primary" size="sm" className="gap-2">
                <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
                Pegar del portapapeles
            </Button>
            {error && (
                <p role="alert" className="max-w-xs text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};
