import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { type JwtDecodeResult } from "../../services/jwtDecoder";
import { Badge } from "../atoms/Badge";

interface JwtInfoProps {
  result: JwtDecodeResult;
  showClaims?: boolean;
}

const formatTimestamp = (ts: number): string => {
  return new Date(ts * 1000).toLocaleString();
};

const isExpired = (exp: number): boolean => {
  return Date.now() > exp * 1000;
};

export const JwtInfo = ({ result, showClaims = true }: JwtInfoProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!result.valid || !result.header) return null;

  const { header, payload } = result;
  const payloadObj = JSON.parse(payload) as Record<string, unknown>;
  const exp = typeof payloadObj.exp === "number" ? payloadObj.exp : null;
  const iat = typeof payloadObj.iat === "number" ? payloadObj.iat : null;
  const nbf = typeof payloadObj.nbf === "number" ? payloadObj.nbf : null;

  const headerEntries = Object.entries(header).filter(
    ([k]) => typeof header[k] === "string" || typeof header[k] === "number" || typeof header[k] === "boolean"
  );

  return (
    <div className="border-b border-slate-200 bg-slate-50/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase text-slate-500 hover:text-slate-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          JWT decodificado
        </span>
        {exp && (
          isExpired(exp)
            ? <Badge variant="error">Expirado</Badge>
            : <Badge variant="success">Válido</Badge>
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Cabecera
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {headerEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-mono"
                >
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-slate-700">{String(value)}</span>
                </span>
              ))}
              {headerEntries.length === 0 && (
                <span className="text-xs text-slate-400 italic">Cabecera vacía</span>
              )}
            </div>
          </div>

          {showClaims && (
            <div>
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Claims
              </h4>
              <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap break-all">
                {payload}
              </pre>
            </div>
          )}

          {(exp || iat || nbf) && (
            <div>
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Fechas
              </h4>
              <div className="space-y-1">
                {iat && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-500">Emitido:</span>
                    <span className="font-mono">{formatTimestamp(iat)}</span>
                  </div>
                )}
                {nbf && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-500">Válido desde:</span>
                    <span className="font-mono">{formatTimestamp(nbf)}</span>
                  </div>
                )}
                {exp && (
                  <div className="flex items-center gap-2 text-xs">
                    {isExpired(exp) ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Expiró:</span>
                        <span className="font-mono text-red-600">{formatTimestamp(exp)}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-slate-500">Expira:</span>
                        <span className="font-mono text-slate-600">{formatTimestamp(exp)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
