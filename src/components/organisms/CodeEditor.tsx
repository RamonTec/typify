import Editor, { type EditorProps } from "@monaco-editor/react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../contexts/ThemeContext";

interface CodeEditorProps {
    value: string;
    onChange?: (value: string | undefined) => void;
    language?: "json" | "typescript";
    readOnly?: boolean;
    className?: string;
}

export const CodeEditor = ({
    value,
    onChange,
    language = "json",
    readOnly = false,
    className,
}: CodeEditorProps) => {
    const { theme } = useTheme();

    const editorOptions: EditorProps["options"] = {
        minimap: { enabled: false },
        fontSize: 16,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: readOnly,
        automaticLayout: true,
        padding: { top: 20, bottom: 20 },
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        renderLineHighlight: "all",
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
            vertical: "visible",
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
        },
        guides: {
            indentation: false
        },
    };

    return (
        <div className={cn("relative h-full w-full overflow-hidden bg-transparent", className)}>
            <Editor
                height="100%"
                width="100%"
                language={language}
                value={value}
                onChange={onChange}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={editorOptions}
                loading={
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        Initializing editor...
                    </div>
                }
            />
        </div>
    );
};