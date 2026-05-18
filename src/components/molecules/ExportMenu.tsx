import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Download } from 'lucide-react';

interface ExportMenuProps {
  tsOutput: string;
  outputMode: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ tsOutput, outputMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getFileName = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (outputMode === 'zod') return `schema-${timestamp}.ts`;
    return `types-${timestamp}.ts`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(tsOutput);
    setIsOpen(false);
  };

  const handleDownload = () => {
    const blob = new Blob([tsOutput], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };


  return (
    <div className="relative">
      <Button 
        variant="primary" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Export"
        title="Export"
      >
        <Download className="h-4 w-4" />
        <span className="ml-2">Export</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 dark:border-slate-700 dark:bg-slate-800">
          <div className="p-2">
            <button
              onClick={handleCopyToClipboard}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Download as .ts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};