import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { FileUp, Link } from 'lucide-react';

interface ImportMenuProps {
  onFileImport: (content: string) => void;
  onUrlImport: (url: string) => Promise<void>;
}

export const ImportMenu: React.FC<ImportMenuProps> = ({ onFileImport, onUrlImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        // Validate that it's JSON
        JSON.parse(content);
        onFileImport(content);
        setIsOpen(false);
      } catch (err) {
        setError('El archivo no contiene JSON válido');
      }
    };
    reader.readAsText(file);
  };

  const handleUrlImport = async () => {
    if (!url) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      await onUrlImport(url);
      setIsOpen(false);
      setUrl('');
    } catch (err) {
      setError('No se pudo obtener un JSON válido desde la URL');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Importar JSON"
        title="Importar JSON"
      >
        <FileUp className="h-4 w-4" />
        <span className="ml-2">Importar</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg z-50 dark:border-slate-700 dark:bg-slate-800">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100">Importar JSON</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                  Desde archivo
                </label>
                <label className="flex items-center justify-center w-full px-3 py-2 border border-dashed border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                  <FileUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">Elegir archivo JSON</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".json,application/json"
                    onChange={handleFileImport}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                  Desde URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/data.json"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleUrlImport}
                    disabled={!url || isImporting}
                    isLoading={isImporting}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-2 text-xs text-red-600 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};