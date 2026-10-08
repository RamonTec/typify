import { useMemo, useState } from "react";
import { FileJson, GitCompare } from "lucide-react";
import { ToolOutputSkeleton, ToolPanel, ToolWorkspace } from "../../components/templates/ToolWorkspace";
import { CodeEditor } from "../../components/organisms/CodeEditor";
import { CompareReport } from "../../components/molecules/CompareReport";
import { InputActions } from "../../components/molecules/InputActions";
import { ImportMenu } from "../../components/molecules/ImportMenu";
import { EditorEmptyOverlay } from "../../components/molecules/EditorEmptyOverlay";
import { EmptyState } from "../../components/molecules/EmptyState";
import { useHistory } from "../../hooks/useHistory";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { compareJson } from "../../services/comparator";
import { isLargeInput } from "../../services/generate";
import { fetchJsonText } from "../../utils/fetchJsonText";
import { cn } from "../../utils/cn";
import { compareEmptyMessage } from "./compareMessages";

type CompareSide = "expected" | "actual";

const SIDES: Record<CompareSide, { label: string; emptyTitle: string; emptyDescription: string }> = {
    expected: {
        label: "Esperado",
        emptyTitle: "Pega el JSON esperado aquí",
        emptyDescription: "La estructura que la API espera recibir o devolver (DTO o contrato).",
    },
    actual: {
        label: "Actual",
        emptyTitle: "Pega el JSON actual aquí",
        emptyDescription: "El payload real que estás enviando o recibiendo.",
    },
};

interface CompareEditorProps {
    side: CompareSide;
    history: ReturnType<typeof useHistory<string>>;
    isMobileVisible: boolean;
}

const CompareEditor = ({ side, history, isMobileVisible }: CompareEditorProps) => {
    const { value, setValue, undo, redo, canUndo, canRedo } = history;
    const { label, emptyTitle, emptyDescription } = SIDES[side];
    const hasValue = value.length > 0;

    const handleUrlImport = async (url: string) => {
        setValue(await fetchJsonText(url));
    };

    return (
        <div
            role="group"
            aria-label={label}
            className={cn("min-h-0 flex-1 flex-col md:flex", isMobileVisible ? "flex" : "hidden")}
        >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white/80 px-4 py-1.5">
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <div className="flex items-center gap-1">
                    <InputActions
                        onUndo={hasValue ? undo : undefined}
                        onRedo={hasValue ? redo : undefined}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onClear={hasValue ? () => setValue("") : undefined}
                    />
                    <ImportMenu onFileImport={setValue} onUrlImport={handleUrlImport} />
                </div>
            </div>
            <div className="relative min-h-[40vh] flex-1 md:min-h-0">
                <CodeEditor
                    language="json"
                    value={value}
                    onChange={(next) => setValue(next ?? "")}
                    className="border-0"
                />
                {!hasValue && (
                    <EditorEmptyOverlay
                        icon={side === "expected" ? FileJson : GitCompare}
                        title={emptyTitle}
                        description={emptyDescription}
                        onPaste={setValue}
                    />
                )}
            </div>
        </div>
    );
};

export const CompareTool = () => {
    const expectedHistory = useHistory<string>("");
    const actualHistory = useHistory<string>("");
    const [mobileSide, setMobileSide] = useState<CompareSide>("expected");

    const expected = expectedHistory.value;
    const actual = actualHistory.value;
    const debouncedExpected = useDebouncedValue(expected);
    const debouncedActual = useDebouncedValue(actual);

    const emptyMessage = compareEmptyMessage(debouncedExpected, debouncedActual);
    const result = useMemo(
        () => (emptyMessage ? null : compareJson(debouncedExpected, debouncedActual)),
        [emptyMessage, debouncedExpected, debouncedActual]
    );

    const isPending = expected !== debouncedExpected || actual !== debouncedActual;
    const showSkeleton = isPending && (isLargeInput(expected) || isLargeInput(actual));

    return (
        <ToolWorkspace
            input={
                <ToolPanel
                    title="Entrada"
                    variant="input"
                    controls={
                        <div
                            role="group"
                            aria-label="Entrada visible"
                            className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 md:hidden"
                        >
                            {(Object.keys(SIDES) as CompareSide[]).map((side) => (
                                <button
                                    key={side}
                                    type="button"
                                    aria-pressed={mobileSide === side}
                                    onClick={() => setMobileSide(side)}
                                    className={cn(
                                        "rounded-md px-3 py-1 text-xs font-medium transition-all",
                                        mobileSide === side
                                            ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                            : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                                    )}
                                >
                                    {SIDES[side].label}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="flex min-h-0 flex-1 flex-col md:divide-y md:divide-slate-200">
                        <CompareEditor side="expected" history={expectedHistory} isMobileVisible={mobileSide === "expected"} />
                        <CompareEditor side="actual" history={actualHistory} isMobileVisible={mobileSide === "actual"} />
                    </div>
                </ToolPanel>
            }
            output={
                <ToolPanel title="Resultado" variant="output">
                    {showSkeleton ? (
                        <ToolOutputSkeleton />
                    ) : result ? (
                        <CompareReport result={result} />
                    ) : (
                        <div className="h-full w-full bg-slate-50/50">
                            <EmptyState
                                icon={GitCompare}
                                title={emptyMessage?.title ?? ""}
                                description={emptyMessage?.description}
                                className="opacity-60"
                            />
                        </div>
                    )}
                </ToolPanel>
            }
        />
    );
};
