import { useState, useEffect } from "react";
import { MainLayout } from "./components/templates/MainLayout";
import { CodeEditor } from "./components/organisms/CodeEditor";
import { Button } from "./components/atoms/Button";
import { Badge } from "./components/atoms/Badge";
import { EmptyState } from "./components/molecules/EmptyState";
import { jsonToTypeScript, type OutputMode } from "./services/converter";
import { formatJson, minifyJson } from "./services/formatter";
import { FileJson, Code2, ClipboardPaste, AlignLeft, Minimize2, Trash2, Undo, Redo, FileCode } from "lucide-react";
import { SegmentedControl } from "./components/molecules/SegmentedControl";
import { jsonToZod } from "./services/zodGenerator";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/atoms/ThemeToggle";
import { useJsonValidation } from "./hooks/useJsonValidation";
import { ImportMenu } from "./components/molecules/ImportMenu";
import { ExportMenu } from "./components/molecules/ExportMenu";
import { useHistory } from "./hooks/useHistory";
import { Skeleton } from "./components/atoms/Skeleton";
import { javaToTypeScript } from "./services/javaToTypeScript";
import { javaToZod } from "./services/javaToZod";

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
  const [inputMode, setInputMode] = useState<'json' | 'java'>('json');
  const { isValid } = useJsonValidation(jsonInput);

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
    if (!jsonInput.trim()) {
      setTsOutput("");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    
    const timer = setTimeout(() => {
      try {
        let result = "";

        if (inputMode === 'java') {
          if (outputMode === 'zod') {
            result = javaToZod(jsonInput);
          } else {
            result = javaToTypeScript(jsonInput, { outputMode: outputMode });
          }
        } else {
          if (outputMode === 'zod') {
            result = jsonToZod(jsonInput, { rootName: "Root" });
          } else {
            result = jsonToTypeScript(jsonInput, {
              rootName: "Root",
              outputMode: outputMode
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
  }, [jsonInput, outputMode, inputMode]);

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
              <SegmentedControl
                value={inputMode}
                onChange={(val) => setInputMode(val as 'json' | 'java')}
                options={[
                  { label: 'JSON', value: 'json', icon: FileJson },
                  { label: 'Java', value: 'java', icon: FileCode },
                ]}
              />
              {inputMode === 'json' && !isValid && <Badge variant="error">Error</Badge>}
            </div>

            <div className="flex items-center gap-1">
              {jsonInput && (
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

              {jsonInput && isValid && (
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

              {jsonInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setJsonInput("")}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Limpiar todo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative flex-1 group">
            <CodeEditor
              language="json"
              value={jsonInput}
              onChange={(val) => setJsonInput(val || "")}
              className="border-0"
            />

            {!jsonInput && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <EmptyState
                  icon={inputMode === 'java' ? FileCode : FileJson}
                  title={inputMode === 'java' ? "Pega tu clase Java aquí" : "Pega tu JSON aquí"}
                  description={inputMode === 'java' ? "Copia tu clase DTO de Java para generar los tipos." : "Copia tu respuesta de API y pégala para generar los tipos."}
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

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase text-slate-500">Output</span>

              <SegmentedControl
                value={outputMode}
                onChange={(val) => setOutputMode(val as OutputMode)}
                options={[
                  { label: 'Interface', value: 'interface' },
                  { label: 'Type', value: 'type' },
                  { label: 'Zod Schema', value: 'zod' },
                ]}
              />
            </div>

            {tsOutput && <ExportMenu tsOutput={tsOutput} outputMode={outputMode} />}
          </div>

          <div className="flex-1 relative">
            {isProcessing ? (
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
            ) : tsOutput ? (
              <CodeEditor
                language="typescript"
                value={tsOutput}
                readOnly={false}
                className="border-0 bg-slate-50"
              />
            ) : (
              <div className="h-full w-full bg-slate-50/50">
                <EmptyState
                  icon={Code2}
                  title="Esperando datos..."
                  description={inputMode === 'java' ? "El código TypeScript generado desde tu clase Java aparecerá aquí automáticamente." : "El código TypeScript generado aparecerá aquí automáticamente."}
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