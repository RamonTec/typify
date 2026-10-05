import { useState, useEffect } from "react";
import { MainLayout } from "./components/templates/MainLayout";
import { CodeEditor } from "./components/organisms/CodeEditor";
import { Button } from "./components/atoms/Button";
import { Badge } from "./components/atoms/Badge";
import { EmptyState } from "./components/molecules/EmptyState";
import { jsonToTypeScript, type OutputMode } from "./services/converter";
import { formatJson, minifyJson } from "./services/formatter";
import { FileJson, Code2, ClipboardPaste, AlignLeft, Minimize2, Trash2, Undo, Redo, FileCode, KeyRound, GitCompare, Workflow, Braces } from "lucide-react";
import { SegmentedControl } from "./components/molecules/SegmentedControl";
import { jsonToZod } from "./services/zodGenerator";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/atoms/ThemeToggle";
import { useJsonValidation } from "./hooks/useJsonValidation";
import { ImportMenu } from "./components/molecules/ImportMenu";
import { ExportMenu } from "./components/molecules/ExportMenu";
import { JwtInfo } from "./components/molecules/JwtInfo";
import { useHistory } from "./hooks/useHistory";
import { Skeleton } from "./components/atoms/Skeleton";
import { javaToTypeScript } from "./services/javaToTypeScript";
import { javaToZod } from "./services/javaToZod";
import { decodeJwtPayload, type JwtDecodeResult } from "./services/jwtDecoder";
import { compareJson, type CompareResult } from "./services/comparator";
import { CompareReport } from "./components/molecules/CompareReport";
import { jsonToMermaid, type MermaidDiagram } from "./services/mermaidGenerator";
import { javaToMermaid } from "./services/javaToMermaid";
import { generateJsonDeserializer } from "./services/jsonDeserializer";
import { generateJwtDeserializer } from "./services/jwtDeserializer";
import { MermaidPreview } from "./components/organisms/MermaidPreview";

function App() {
  const {
    value: jsonInput,
    setValue: setJsonInput,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<string>("");
  const [tsOutput, setTsOutput] = useState<string>("");
  const [outputMode, setOutputMode] = useState<OutputMode>('interface');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'json' | 'java' | 'jwt' | 'mermaid'>('json');
  const [jwtResult, setJwtResult] = useState<JwtDecodeResult>({ valid: false, payload: '', header: null });
  const { isValid } = useJsonValidation(jsonInput);
  const [actualPayload, setActualPayload] = useState<string>("");
  const [activeCompareTab, setActiveCompareTab] = useState<'expected' | 'actual'>('expected');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [mermaidType, setMermaidType] = useState<MermaidDiagram>('class');
  const isCompareMode = outputMode === 'compare';

  const handleFormat = () => {
    if (!jsonInput) return;
    try {
      const formatted = formatJson(jsonInput);
      setJsonInput(formatted);
    } catch  {
      console.error("JSON Inválido");
    }
  };

  const handleMinify = () => {
    if (!jsonInput) return;
    try {
      const minified = minifyJson(jsonInput);
      setJsonInput(minified);
    } catch  {
      console.error("JSON Inválido");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch  {
      console.error("Permiso denegado para leer portapapeles");
    }
  };

  const handleFileImport = (content: string) => {
    setJsonInput(content);
  };

  const handleUrlImport = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      JSON.parse(content);
      setJsonInput(content);
    } catch  {
      throw new Error('Failed to fetch or parse JSON');
    }
  };

  useEffect(() => {
    if (inputMode === 'mermaid') {
      setTsOutput("");
      setCompareResult(null);
      setIsProcessing(false);
      return;
    }

    if (outputMode === 'compare') {
      if (!jsonInput.trim() || !actualPayload.trim()) {
        setCompareResult(null);
        setTsOutput("");
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);

      const timer = setTimeout(() => {
        const result = compareJson(jsonInput, actualPayload);
        setCompareResult(result);
        setIsProcessing(false);
      }, 500);

      return () => {
        clearTimeout(timer);
        setIsProcessing(false);
      };
    }

    if (!jsonInput.trim()) {
      setTsOutput("");
      setCompareResult(null);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    const timer = setTimeout(() => {
      try {
        let result = "";

        if (inputMode === 'java') {
          if (outputMode === 'mermaid') {
            result = javaToMermaid(jsonInput, { diagram: mermaidType });
          } else if (outputMode === 'zod') {
            result = javaToZod(jsonInput);
          } else {
            const javaMode = outputMode === 'type' ? 'type' : 'interface';
            result = javaToTypeScript(jsonInput, { outputMode: javaMode });
          }
        } else if (inputMode === 'jwt') {
          const decoded = decodeJwtPayload(jsonInput);
          setJwtResult(decoded);
          if (decoded.valid) {
            if (outputMode === 'mermaid') {
              result = jsonToMermaid(decoded.payload, { diagram: mermaidType, rootName: "JwtPayload" });
            } else if (outputMode === 'deserialize') {
              result = generateJwtDeserializer(decoded.payload);
            } else if (outputMode === 'zod') {
              result = jsonToZod(decoded.payload, { rootName: "JwtPayload" });
            } else {
              const tsMode = outputMode === 'type' ? 'type' : 'interface';
              result = jsonToTypeScript(decoded.payload, {
                rootName: "JwtPayload",
                outputMode: tsMode
              });
            }
          }
        } else {
          if (outputMode === 'mermaid') {
            result = jsonToMermaid(jsonInput, { diagram: mermaidType });
          } else if (outputMode === 'deserialize') {
            result = generateJsonDeserializer(jsonInput);
          } else if (outputMode === 'zod') {
            result = jsonToZod(jsonInput, { rootName: "Root" });
          } else {
            const tsMode = outputMode === 'type' ? 'type' : 'interface';
            result = jsonToTypeScript(jsonInput, {
              rootName: "Root",
              outputMode: tsMode
            });
          }
        }

        setTsOutput(result);
      } catch (err) {
        setTsOutput("");
        console.error("Error generating output:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsProcessing(false);
    };
  }, [jsonInput, actualPayload, outputMode, inputMode, mermaidType]);

  return (
    <ThemeProvider>
      <MainLayout
      header={
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">Typify</h1>
            <Badge variant="success">Beta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ImportMenu onFileImport={handleFileImport} onUrlImport={handleUrlImport} />
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={() => window.open('https://buymeacoffee.com', '_blank')}>
              ☕ Buy me a Coffee
            </Button>
          </div>
        </div>
      }

      leftPanel={
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-white z-10">

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">Input</span>
              {isCompareMode ? (
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
                  <button
                    onClick={() => setActiveCompareTab('expected')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      activeCompareTab === 'expected'
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Expected DTO
                  </button>
                  <button
                    onClick={() => setActiveCompareTab('actual')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      activeCompareTab === 'actual'
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Actual Payload
                  </button>
                </div>
              ) : (
                <SegmentedControl
                  value={inputMode}
                  onChange={(val) => setInputMode(val as 'json' | 'java' | 'jwt' | 'mermaid')}
                  options={[
                    { label: 'JSON', value: 'json', icon: FileJson },
                    { label: 'Java', value: 'java', icon: FileCode },
                    { label: 'JWT', value: 'jwt', icon: KeyRound },
                    { label: 'Mermaid', value: 'mermaid', icon: Workflow },
                  ]}
                />
              )}
              {!isCompareMode && inputMode === 'json' && !isValid && <Badge variant="error">Error</Badge>}
              {!isCompareMode && inputMode === 'jwt' && jsonInput.trim() && (
                jwtResult.valid
                  ? <Badge variant="success">
                      {jwtResult.header && typeof jwtResult.header.alg === 'string'
                        ? jwtResult.header.alg
                        : 'JWT'}
                    </Badge>
                  : <Badge variant="error" title={jwtResult.error}>{jwtResult.error || 'Inválido'}</Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!isCompareMode && jsonInput && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo"
                  >
                    <Undo className="h-4 w-4 text-slate-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo"
                  >
                    <Redo className="h-4 w-4 text-slate-600" />
                  </Button>

                  <div className="mx-1 h-4 w-px bg-slate-200" />
                </>
              )}

              {!isCompareMode && jsonInput && inputMode === 'json' && isValid && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFormat}
                    title="Formatear (Pretty Print)"
                  >
                    <AlignLeft className="h-4 w-4 text-slate-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMinify}
                    title="Minificar"
                  >
                    <Minimize2 className="h-4 w-4 text-slate-600" />
                  </Button>

                  <div className="mx-1 h-4 w-px bg-slate-200" />
                </>
              )}

              {(isCompareMode && activeCompareTab === 'actual' ? actualPayload : jsonInput) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isCompareMode && activeCompareTab === 'actual') {
                      setActualPayload("");
                    } else {
                      setJsonInput("");
                    }
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Limpiar todo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!isCompareMode && inputMode === 'jwt' && jwtResult.valid && <JwtInfo result={jwtResult} />}

          <div className="relative flex-1 group">
            <CodeEditor
              language={inputMode === 'mermaid' ? 'plaintext' : 'json'}
              value={isCompareMode && activeCompareTab === 'actual' ? actualPayload : jsonInput}
              onChange={(val) => {
                const newVal = val || "";
                if (isCompareMode && activeCompareTab === 'actual') {
                  setActualPayload(newVal);
                } else {
                  setJsonInput(newVal);
                }
              }}
              className="border-0"
            />

            {!(isCompareMode && activeCompareTab === 'actual' ? actualPayload : jsonInput) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <EmptyState
                  icon={isCompareMode ? GitCompare : inputMode === 'java' ? FileCode : inputMode === 'jwt' ? KeyRound : inputMode === 'mermaid' ? Workflow : FileJson}
                  title={
                    isCompareMode
                      ? activeCompareTab === 'expected'
                        ? "Pega el DTO esperado aquí"
                        : "Pega el payload actual aquí"
                      : inputMode === 'java'
                        ? "Pega tu clase Java aquí"
                        : inputMode === 'jwt'
                          ? "Pega tu JWT aquí"
                          : inputMode === 'mermaid'
                            ? "Pega tu diagrama Mermaid aquí"
                            : "Pega tu JSON aquí"
                  }
                  description={
                    isCompareMode
                      ? "Pega la estructura JSON que la API espera recibir (expected) y el payload que estás enviando (actual) para compararlos."
                      : inputMode === 'java'
                        ? "Copia tu clase DTO de Java para generar los tipos."
                        : inputMode === 'jwt'
                          ? "Copia tu JWT (header.payload.signature) para decodificar su payload."
                          : inputMode === 'mermaid'
                            ? "Copia tu diagrama Mermaid (flowchart, classDiagram, etc.) para renderizar la vista previa."
                            : "Copia tu respuesta de API y pégala para generar los tipos."
                  }
                  action={
                    <Button onClick={handlePasteFromClipboard} variant="primary" size="sm" className="gap-2">
                      <ClipboardPaste className="h-4 w-4" />
                      Pegar del Portapapeles
                    </Button>
                  }
                />
              </div>
            )}

            
          </div>
        </div>
      }

      rightPanel={
        <div className="flex h-full flex-col bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 bg-white">

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-semibold uppercase text-slate-500">
                {inputMode === 'mermaid' ? 'Preview' : 'Output'}
              </span>

              {inputMode !== 'mermaid' && (
                <SegmentedControl
                  value={outputMode}
                  onChange={(val) => setOutputMode(val as OutputMode)}
                  options={[
                    { label: 'Interface', value: 'interface' },
                    { label: 'Type', value: 'type' },
                    { label: 'Zod Schema', value: 'zod' },
                    { label: 'Compare', value: 'compare', icon: GitCompare },
                    { label: 'Mermaid', value: 'mermaid', icon: Workflow },
                    ...(inputMode !== 'java'
                      ? [{ label: 'Deserialize', value: 'deserialize', icon: Braces }]
                      : []),
                  ]}
                />
              )}

              {inputMode !== 'mermaid' && outputMode === 'mermaid' && (
                <SegmentedControl
                  value={mermaidType}
                  onChange={(val) => setMermaidType(val as MermaidDiagram)}
                  options={[
                    { label: 'Class', value: 'class' },
                    { label: 'ER', value: 'er' },
                    { label: 'Flow', value: 'flow' },
                  ]}
                />
              )}
            </div>

            {inputMode !== 'mermaid' && !isCompareMode && tsOutput && <ExportMenu tsOutput={tsOutput} outputMode={outputMode} />}
          </div>

          <div className="flex-1 relative">
            {inputMode === 'mermaid' ? (
              <MermaidPreview code={jsonInput} />
            ) : isProcessing ? (
              <div className="flex h-full w-full flex-col bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/6" />
                </div>
              </div>
            ) : isCompareMode ? (
              compareResult ? (
                <CompareReport result={compareResult} />
              ) : (
                <div className="h-full w-full bg-slate-50/50">
                  <EmptyState
                    icon={GitCompare}
                    title="Waiting for inputs..."
                    description={!jsonInput.trim() && !actualPayload.trim()
                      ? "Paste the expected DTO and the actual payload in the left panel to compare them."
                      : !jsonInput.trim()
                        ? "Paste the expected DTO JSON in the left panel first."
                        : "Now paste the actual payload JSON (switch to the 'Actual Payload' tab) to see the comparison."
                    }
                    className="opacity-60"
                  />
                </div>
              )
            ) : tsOutput ? (
              <CodeEditor
                language={outputMode === 'mermaid' ? 'plaintext' : 'typescript'}
                value={tsOutput}
                readOnly={false}
                className="border-0 bg-slate-50"
              />
            ) : (
              <div className="h-full w-full bg-slate-50/50">
                <EmptyState
                  icon={Code2}
                  title="Esperando datos..."
                  description={
                    outputMode === 'mermaid'
                      ? "El diagrama Mermaid (Class/ER/Flow) generado aparecerá aquí automáticamente."
                      : outputMode === 'deserialize'
                        ? "La función deserializadora (parseJson / deserializeJwt) aparecerá aquí automáticamente."
                        : inputMode === 'java'
                          ? "El código TypeScript generado desde tu clase Java aparecerá aquí automáticamente."
                          : inputMode === 'jwt'
                            ? "El payload decodificado del JWT se convertirá aquí automáticamente."
                            : "El código TypeScript generado aparecerá aquí automáticamente."
                  }
                  className="opacity-60"
                />
              </div>
            )}
          </div>
        </div>
      }
    />
    </ThemeProvider>
  );
}

export default App;