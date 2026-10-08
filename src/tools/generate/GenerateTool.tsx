import { useMemo, useState } from "react";
import { Braces, Code2, FileCode, FileJson, KeyRound, Workflow, type LucideIcon } from "lucide-react";
import { ToolOutputSkeleton, ToolPanel, ToolWorkspace } from "../../components/templates/ToolWorkspace";
import { CodeEditor } from "../../components/organisms/CodeEditor";
import { SegmentedControl } from "../../components/molecules/SegmentedControl";
import { InputActions } from "../../components/molecules/InputActions";
import { ImportMenu } from "../../components/molecules/ImportMenu";
import { ExportMenu } from "../../components/molecules/ExportMenu";
import { EditorEmptyOverlay } from "../../components/molecules/EditorEmptyOverlay";
import { EmptyState } from "../../components/molecules/EmptyState";
import { Badge } from "../../components/atoms/Badge";
import { useHistory } from "../../hooks/useHistory";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useJsonValidation } from "../../hooks/useJsonValidation";
import { generate, isLargeInput, resolveOutputMode, SUPPORTED_OUTPUTS, type InputKind } from "../../services/generate";
import { formatJson, minifyJson } from "../../services/formatter";
import { decodeJwtPayload } from "../../services/jwtDecoder";
import type { OutputMode } from "../../services/converter";
import type { MermaidDiagram } from "../../services/mermaidGenerator";
import { fetchJsonText } from "../../utils/fetchJsonText";

type GeneratorOutput = (typeof SUPPORTED_OUTPUTS)[InputKind][number];

const INPUT_OPTIONS: { label: string; value: InputKind; icon: LucideIcon }[] = [
    { label: "JSON", value: "json", icon: FileJson },
    { label: "Java", value: "java", icon: FileCode },
    { label: "JWT", value: "jwt", icon: KeyRound },
];

const OUTPUT_OPTIONS: Record<GeneratorOutput, { label: string; icon?: LucideIcon }> = {
    interface: { label: "Interface" },
    type: { label: "Type" },
    zod: { label: "Zod Schema" },
    mermaid: { label: "Mermaid", icon: Workflow },
    deserialize: { label: "Deserializador", icon: Braces },
};

const DIAGRAM_OPTIONS: { label: string; value: MermaidDiagram }[] = [
    { label: "Clase", value: "class" },
    { label: "ER", value: "er" },
    { label: "Flujo", value: "flow" },
];

const INPUT_EMPTY_STATE: Record<InputKind, { icon: LucideIcon; title: string; description: string }> = {
    json: {
        icon: FileJson,
        title: "Pega tu JSON aquí",
        description: "Copia tu respuesta de API y pégala para generar los tipos.",
    },
    java: {
        icon: FileCode,
        title: "Pega tu clase Java aquí",
        description: "Copia tu clase DTO de Java para generar los tipos.",
    },
    jwt: {
        icon: KeyRound,
        title: "Pega tu JWT aquí",
        description: "Copia tu JWT (header.payload.signature) para generar los tipos de su payload.",
    },
};

const outputEmptyDescription = (kind: InputKind, mode: OutputMode): string => {
    if (mode === "mermaid") return "El diagrama Mermaid (Clase/ER/Flujo) generado aparecerá aquí automáticamente.";
    if (mode === "deserialize") return "La función deserializadora (parseJson / deserializeJwt) aparecerá aquí automáticamente.";
    if (kind === "java") return "El código TypeScript generado desde tu clase Java aparecerá aquí automáticamente.";
    if (kind === "jwt") return "El payload decodificado del JWT se convertirá aquí automáticamente.";
    return "El código TypeScript generado aparecerá aquí automáticamente.";
};

export const GenerateTool = () => {
    const { value: input, setValue: setInput, undo, redo, canUndo, canRedo } = useHistory<string>("");
    const [inputKind, setInputKind] = useState<InputKind>("json");
    const [outputMode, setOutputMode] = useState<OutputMode>("interface");
    const [diagram, setDiagram] = useState<MermaidDiagram>("class");

    const debouncedInput = useDebouncedValue(input);
    const { isValid: isValidJson } = useJsonValidation(inputKind === "json" ? input : "");

    const result = useMemo(
        () => generate(debouncedInput, inputKind, outputMode, { diagram }),
        [debouncedInput, inputKind, outputMode, diagram]
    );
    const jwt = useMemo(
        () => (inputKind === "jwt" && debouncedInput.trim() ? decodeJwtPayload(debouncedInput) : null),
        [inputKind, debouncedInput]
    );

    const output = result.ok ? result.output : "";
    const showSkeleton = input !== debouncedInput && isLargeInput(input);
    const hasInput = input.length > 0;
    const canFormat = inputKind === "json" && hasInput && isValidJson;

    const handleInputKindChange = (kind: InputKind) => {
        setInputKind(kind);
        setOutputMode((mode) => resolveOutputMode(kind, mode));
    };

    const handleUrlImport = async (url: string) => {
        setInput(await fetchJsonText(url));
    };

    const emptyState = INPUT_EMPTY_STATE[inputKind];

    return (
        <ToolWorkspace
            input={
                <ToolPanel
                    title="Entrada"
                    variant="input"
                    controls={
                        <>
                            <SegmentedControl
                                value={inputKind}
                                onChange={(value) => handleInputKindChange(value as InputKind)}
                                options={INPUT_OPTIONS}
                            />
                            {inputKind === "json" && !isValidJson && <Badge variant="error">Error</Badge>}
                            {jwt && input.trim() && (
                                jwt.valid ? (
                                    <Badge variant="success">
                                        {jwt.header && typeof jwt.header.alg === "string" ? jwt.header.alg : "JWT"}
                                    </Badge>
                                ) : (
                                    <Badge variant="error" title={jwt.error}>
                                        {jwt.error || "Inválido"}
                                    </Badge>
                                )
                            )}
                        </>
                    }
                    actions={
                        <>
                            <InputActions
                                onUndo={hasInput ? undo : undefined}
                                onRedo={hasInput ? redo : undefined}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onFormat={canFormat ? () => setInput(formatJson(input)) : undefined}
                                onMinify={canFormat ? () => setInput(minifyJson(input)) : undefined}
                                onClear={hasInput ? () => setInput("") : undefined}
                            />
                            <ImportMenu onFileImport={setInput} onUrlImport={handleUrlImport} />
                        </>
                    }
                >
                    <CodeEditor
                        language="json"
                        value={input}
                        onChange={(value) => setInput(value ?? "")}
                        className="border-0"
                    />
                    {!hasInput && (
                        <EditorEmptyOverlay
                            icon={emptyState.icon}
                            title={emptyState.title}
                            description={emptyState.description}
                            onPaste={setInput}
                        />
                    )}
                </ToolPanel>
            }
            output={
                <ToolPanel
                    title="Salida"
                    variant="output"
                    controls={
                        <>
                            <SegmentedControl
                                value={outputMode}
                                onChange={(value) => setOutputMode(value as OutputMode)}
                                options={SUPPORTED_OUTPUTS[inputKind].map((mode) => ({
                                    value: mode,
                                    ...OUTPUT_OPTIONS[mode],
                                }))}
                            />
                            {outputMode === "mermaid" && (
                                <SegmentedControl
                                    value={diagram}
                                    onChange={(value) => setDiagram(value as MermaidDiagram)}
                                    options={DIAGRAM_OPTIONS}
                                />
                            )}
                        </>
                    }
                    actions={output && !showSkeleton ? <ExportMenu tsOutput={output} outputMode={outputMode} /> : undefined}
                >
                    {showSkeleton ? (
                        <ToolOutputSkeleton />
                    ) : output ? (
                        <CodeEditor
                            language={outputMode === "mermaid" ? "plaintext" : "typescript"}
                            value={output}
                            className="border-0 bg-slate-50"
                        />
                    ) : (
                        <div className="h-full w-full bg-slate-50/50">
                            <EmptyState
                                icon={Code2}
                                title="Esperando datos..."
                                description={outputEmptyDescription(inputKind, outputMode)}
                                className="opacity-60"
                            />
                        </div>
                    )}
                </ToolPanel>
            }
        />
    );
};
