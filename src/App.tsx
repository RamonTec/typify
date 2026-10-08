import { useState } from "react";
import { MainLayout } from "./components/templates/MainLayout";
import { ToolNav } from "./components/organisms/ToolNav";
import { ToolHost } from "./components/organisms/ToolHost";
import { Button } from "./components/atoms/Button";
import { Badge } from "./components/atoms/Badge";
import { ThemeToggle } from "./components/atoms/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DEFAULT_TOOL_ID, type ToolId } from "./tools/catalog";
import { TOOLS } from "./tools/registry";

function App() {
  const [activeToolId, setActiveToolId] = useState<ToolId>(DEFAULT_TOOL_ID);
  const [mountedToolIds, setMountedToolIds] = useState<ToolId[]>([DEFAULT_TOOL_ID]);

  const handleSelectTool = (id: ToolId) => {
    setActiveToolId(id);
    setMountedToolIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  };

  return (
    <ThemeProvider>
      <MainLayout
        header={
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-indigo-600">Typify</h1>
              <Badge variant="success">Beta</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={() => window.open("https://buymeacoffee.com", "_blank")}>
                ☕ Invítame a un café
              </Button>
            </div>
          </div>
        }
        nav={<ToolNav tools={TOOLS} activeId={activeToolId} onSelect={handleSelectTool} />}
      >
        <ToolHost tools={TOOLS} activeId={activeToolId} mountedIds={mountedToolIds} />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
