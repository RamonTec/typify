import { memo, useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Badge } from "../atoms/Badge";
import { ChevronDown, CheckCircle, AlertTriangle, FileWarning, PlusCircle, Type } from "lucide-react";
import type { CompareResult, Difference, DiffType } from "../../services/comparator";
import { DIFF_LABELS } from "../../services/comparator";

interface CompareReportProps {
  result: CompareResult;
  className?: string;
}

const BORDER_COLORS: Record<DiffType, string> = {
  missing: "border-l-rose-500",
  extra: "border-l-amber-400",
  type_mismatch: "border-l-orange-500",
  null_mismatch: "border-l-red-500",
};

const BADGE_VARIANTS: Record<DiffType, "error" | "warning"> = {
  missing: "error",
  extra: "warning",
  type_mismatch: "warning",
  null_mismatch: "error",
};

const DiffIcon = ({ type }: { type: DiffType }) => {
  const iconClass = "h-3.5 w-3.5 shrink-0";
  switch (type) {
    case "missing":
      return <AlertTriangle className={cn(iconClass, "text-rose-500")} />;
    case "extra":
      return <PlusCircle className={cn(iconClass, "text-amber-500")} />;
    case "type_mismatch":
      return <Type className={cn(iconClass, "text-orange-500")} />;
    case "null_mismatch":
      return <FileWarning className={cn(iconClass, "text-red-500")} />;
  }
};

function DiffComparison({ diff }: { diff: Difference }) {
  switch (diff.type) {
    case "missing":
      return (
        <span className="text-xs font-mono text-rose-600">
          Esperado:{" "}
          <span className="font-semibold">{diff.expected}</span>
        </span>
      );
    case "extra":
      return (
        <span className="text-xs font-mono text-amber-600">
          Encontrado:{" "}
          <span className="font-semibold">{diff.actual}</span>
        </span>
      );
    case "type_mismatch":
      return (
        <span className="text-xs font-mono">
          <span className="text-slate-500 line-through">{diff.expected}</span>
          <span className="mx-1 text-slate-400">&rarr;</span>
          <span className="font-semibold text-orange-500">{diff.actual}</span>
        </span>
      );
    case "null_mismatch":
      return (
        <span className="text-xs font-mono">
          <span className="text-slate-500">{diff.expected}</span>
          <span className="mx-1 text-slate-400">&rarr;</span>
          <span className="font-semibold text-red-500">{diff.actual}</span>
        </span>
      );
  }
}

const DiffEntry = memo(function DiffEntry({
  diff,
  index,
}: {
  diff: Difference;
  index: number;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors",
        BORDER_COLORS[diff.type],
        "border-l-4",
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: "diffFadeIn 0.3s ease-out both",
      }}
    >
      <div className="mb-1 font-mono text-xs text-slate-500">
        {diff.path || "(raíz)"}
      </div>
      <div className="flex items-center gap-2">
        <DiffIcon type={diff.type} />
        <Badge variant={BADGE_VARIANTS[diff.type]}>
          {DIFF_LABELS[diff.type]}
        </Badge>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <DiffComparison diff={diff} />
      </div>
      <p className="mt-1 text-xs text-slate-400">{diff.message}</p>
    </div>
  );
});

export const CompareReport = memo(function CompareReport({
  result,
  className,
}: CompareReportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generatedRef, setGeneratedRef] = useState<"ts" | "zod">("ts");

  const differences = useMemo(
    () => (result.status === "success" ? result.differences : []),
    [result],
  );
  const isValid = result.status === "success" ? result.isValid : false;
  const expectedTs = result.status === "success" ? result.expectedTs : "";
  const expectedZod = result.status === "success" ? result.expectedZod : "";
  const isError = result.status === "error";

  const missing = useMemo(
    () => differences.filter((d) => d.type === "missing"),
    [differences],
  );
  const extra = useMemo(
    () => differences.filter((d) => d.type === "extra"),
    [differences],
  );
  const typeMismatches = useMemo(
    () => differences.filter((d) => d.type === "type_mismatch"),
    [differences],
  );
  const nullMismatches = useMemo(
    () => differences.filter((d) => d.type === "null_mismatch"),
    [differences],
  );

  if (isError) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="border-b border-slate-200 px-4 py-3 bg-white">
          <h3 className="text-sm font-semibold text-slate-700">
            Informe de comparación
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <FileWarning className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-2 text-sm font-medium text-red-600">
              JSON inválido
            </p>
            <p className="mt-1 text-xs text-slate-500">{result.error}</p>
            <p className="mt-2 text-xs text-slate-400">
              Revisa que las dos entradas contengan JSON válido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <style>{`
        @keyframes diffFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Informe de comparación
        </h3>
        {isValid ? (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">
              Todos los campos coinciden
            </span>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {missing.length > 0 && (
              <Badge variant="error">{missing.length} {missing.length === 1 ? "falta" : "faltan"}</Badge>
            )}
            {extra.length > 0 && (
              <Badge variant="warning">{extra.length} {extra.length === 1 ? "sobra" : "sobran"}</Badge>
            )}
            {typeMismatches.length > 0 && (
              <Badge variant="warning">
                {typeMismatches.length} con tipo distinto
              </Badge>
            )}
            {nullMismatches.length > 0 && (
              <Badge variant="error">
                {nullMismatches.length} con null inesperado
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/80">
        {differences.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <span className="text-sm font-medium">
              El payload coincide con el DTO esperado
            </span>
            <span className="text-xs text-slate-400">
              No hay diferencias de estructura
            </span>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {differences.map((diff, i) => (
              <DiffEntry key={diff.path + diff.type} diff={diff} index={i} />
            ))}
          </div>
        )}
      </div>

      {(expectedTs || expectedZod) && (
        <div className="flex-shrink-0 border-t border-slate-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between bg-white px-4 py-2.5 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
              Tipos generados
            </span>
            <span className="text-xs text-slate-400">
              {differences.length === 0
                ? "Referencia"
                : `${differences.length} ${differences.length === 1 ? "diferencia" : "diferencias"}`}
            </span>
          </button>

          {isExpanded && (
            <div className="border-t border-slate-100 bg-slate-50">
              <div className="flex gap-1 border-b border-slate-200 px-4 py-2">
                <button
                  onClick={() => setGeneratedRef("ts")}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                    generatedRef === "ts"
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Interface
                </button>
                <button
                  onClick={() => setGeneratedRef("zod")}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                    generatedRef === "zod"
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Zod Schema
                </button>
              </div>
              <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-700">
                {generatedRef === "zod" ? expectedZod : expectedTs}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
