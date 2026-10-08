import { Workflow } from "lucide-react";
import { ToolPanel, ToolWorkspace } from "../../components/templates/ToolWorkspace";
import { CodeEditor } from "../../components/organisms/CodeEditor";
import { MermaidPreview } from "../../components/organisms/MermaidPreview";
import { InputActions } from "../../components/molecules/InputActions";
import { EditorEmptyOverlay } from "../../components/molecules/EditorEmptyOverlay";
import { useHistory } from "../../hooks/useHistory";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export const MermaidTool = () => {
    const { value: code, setValue: setCode, undo, redo, canUndo, canRedo } = useHistory<string>("");
    const debouncedCode = useDebouncedValue(code);
    const hasCode = code.length > 0;

    return (
        <ToolWorkspace
            input={
                <ToolPanel
                    title="Diagrama"
                    variant="input"
                    actions={
                        <InputActions
                            onUndo={hasCode ? undo : undefined}
                            onRedo={hasCode ? redo : undefined}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onClear={hasCode ? () => setCode("") : undefined}
                        />
                    }
                >
                    <CodeEditor
                        language="plaintext"
                        value={code}
                        onChange={(value) => setCode(value ?? "")}
                        className="border-0"
                    />
                    {!hasCode && (
                        <EditorEmptyOverlay
                            icon={Workflow}
                            title="Pega tu diagrama Mermaid aquí"
                            description="Copia tu diagrama Mermaid (flowchart, classDiagram, etc.) para renderizar la vista previa."
                            onPaste={setCode}
                        />
                    )}
                </ToolPanel>
            }
            output={
                <ToolPanel title="Vista previa" variant="output">
                    <MermaidPreview code={debouncedCode} />
                </ToolPanel>
            }
        />
    );
};
