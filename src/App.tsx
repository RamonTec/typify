import { useState, useEffect } from "react";
import { MainLayout } from "./components/templates/MainLayout";
import { CodeEditor } from "./components/organisms/CodeEditor";
import { Button } from "./components/atoms/Button";
import { Badge } from "./components/atoms/Badge";
import { EmptyState } from "./components/molecules/EmptyState";
import { jsonToTypeScript, type OutputMode } from "./services/converter";
import { formatJson, minifyJson } from "./services/formatter";
import { FileJson, Code2, ClipboardPaste, AlignLeft, Minimize2, Trash2 } from "lucide-react";
import { SegmentedControl } from "./components/molecules/SegmentedControl";
import { jsonToZod } from "./services/zodGenerator";

function App() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [tsOutput, setTsOutput] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<OutputMode>('interface');

  const handleFormat = () => {
    if (!jsonInput) return;
    try {
      const formatted = formatJson(jsonInput);
      setJsonInput(formatted);
    } catch (error) {
      console.error("JSON Inválido");
    }
  };

  const handleMinify = () => {
    if (!jsonInput) return;
    try {
      const minified = minifyJson(jsonInput);
      setJsonInput(minified);
    } catch (error) {
      console.error("JSON Inválido");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (err) {
      console.error("Permiso denegado para leer portapapeles");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!jsonInput.trim()) {
        return;
      }

      try {
        let result = "";

        if (outputMode === 'zod') {
          result = jsonToZod(jsonInput, { rootName: "Root" });
        } else {
          result = jsonToTypeScript(jsonInput, {
            rootName: "Root",
            outputMode: outputMode
          });
        }

        setTsOutput(result);
        setIsValid(true);
        setErrorMsg(null);
      } catch (err) {
        setIsValid(false);
        if (err instanceof Error) setErrorMsg(err.message);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [jsonInput, outputMode]);

  return (
    <MainLayout
      header={
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">Typify</h1>
            <Badge variant="success">Beta</Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.open('https://buymeacoffee.com', '_blank')}>
            ☕ Buy me a Coffee
          </Button>
        </div>
      }

      leftPanel={
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-white z-10">

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">JSON</span>
              {!isValid && <Badge variant="error">Error</Badge>}
            </div>

            <div className="flex items-center gap-1">
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
                  icon={FileJson}
                  title="Pega tu JSON aquí"
                  description="Copia tu respuesta de API y pégala para generar los tipos."
                  action={
                    <Button onClick={handlePasteFromClipboard} variant="primary" size="sm" className="gap-2">
                      <ClipboardPaste className="h-4 w-4" />
                      Pegar del Portapapeles
                    </Button>
                  }
                />
              </div>
            )}

            {!isValid && errorMsg && (
              <div className="absolute bottom-4 left-4 right-4 z-20 animate-in slide-in-from-bottom-2">
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 shadow-sm flex items-center gap-2">
                  <span className="font-bold">Error:</span> {errorMsg}
                </div>
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

            {tsOutput && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigator.clipboard.writeText(tsOutput)}
              >
                Copiar
              </Button>
            )}
          </div>

          <div className="flex-1 relative">
            {tsOutput ? (
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
                  description="El código TypeScript generado aparecerá aquí automáticamente."
                  className="opacity-60"
                />
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}

export default App;