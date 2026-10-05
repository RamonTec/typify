import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Workflow, AlertTriangle, ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { EmptyState } from "../molecules/EmptyState";

interface MermaidPreviewProps {
    code: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const FIT_PADDING = 24;

export const MermaidPreview = ({ code }: MermaidPreviewProps) => {
    const { theme } = useTheme();
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapRef = useRef<HTMLDivElement>(null);

    const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

    const resetView = useCallback((nextZoom: number, nextPan: { x: number; y: number }) => {
        setZoom(nextZoom);
        setPan(nextPan);
    }, []);

    const applyFit = useCallback(() => {
        const container = containerRef.current;
        const wrap = svgWrapRef.current;
        if (!container || !wrap) return;

        const svgEl = wrap.querySelector("svg");
        if (!svgEl) return;

        const panelW = container.clientWidth - FIT_PADDING * 2;
        const panelH = container.clientHeight - FIT_PADDING * 2;

        const rect = svgEl.getBoundingClientRect();
        const svgW = rect.width || svgEl.viewBox.baseVal.width || 1;
        const svgH = rect.height || svgEl.viewBox.baseVal.height || 1;

        const scale = Math.min(panelW / svgW, panelH / svgH, 1);
        const cx = (container.clientWidth - svgW * scale) / 2;
        const cy = (container.clientHeight - svgH * scale) / 2;

        resetView(scale, { x: cx, y: cy });
    }, [resetView]);

    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            if (!code.trim()) {
                setSvg(null);
                setError(null);
                return;
            }

            setError(null);

            try {
                const mermaid = await import("mermaid");
                mermaid.default.initialize({
                    startOnLoad: false,
                    theme: theme === "dark" ? "dark" : "default",
                    securityLevel: "strict",
                    flowchart: { useMaxWidth: false },
                });

                const id = `mermaid-preview-${Date.now()}`;
                const { svg: renderedSvg } = await mermaid.default.render(id, code);

                if (!cancelled) {
                    setSvg(renderedSvg);
                }
            } catch (err) {
                if (!cancelled) {
                    setSvg(null);
                    setError(
                        err instanceof Error ? err.message : "Error al renderizar el diagrama"
                    );
                }
            }
        };

        render();

        return () => {
            cancelled = true;
        };
    }, [code, theme]);

    useEffect(() => {
        if (!svg) return;

        const timer = requestAnimationFrame(() => {
            applyFit();
        });

        return () => cancelAnimationFrame(timer);
    }, [svg, applyFit]);

    const handleWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();

            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const cursorX = e.clientX - rect.left;
            const cursorY = e.clientY - rect.top;

            const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;

            setZoom((prevZoom) => {
                const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));

                setPan((prevPan) => {
                    const worldX = (cursorX - prevPan.x) / prevZoom;
                    const worldY = (cursorY - prevPan.y) / prevZoom;
                    return {
                        x: cursorX - worldX * nextZoom,
                        y: cursorY - worldY * nextZoom,
                    };
                });

                return nextZoom;
            });
        },
        []
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0) return;
            e.preventDefault();
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                panX: pan.x,
                panY: pan.y,
            };
        },
        [pan]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        setPan({
            x: drag.panX + (e.clientX - drag.startX),
            y: drag.panY + (e.clientY - drag.startY),
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        dragRef.current = null;
    }, []);

    const handleDoubleClick = useCallback(() => {
        applyFit();
    }, [applyFit]);

    const zoomBy = useCallback(
        (factor: number) => {
            setZoom((prevZoom) => {
                const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
                return nextZoom;
            });
        },
        []
    );

    const handleReset = useCallback(() => {
        const container = containerRef.current;
        const wrap = svgWrapRef.current;
        if (!container || !wrap) {
            resetView(1, { x: 0, y: 0 });
            return;
        }

        const svgEl = wrap.querySelector("svg");
        const rect = svgEl?.getBoundingClientRect();
        const svgW = rect?.width ?? 0;
        const svgH = rect?.height ?? 0;

        const cx = (container.clientWidth - svgW) / 2;
        const cy = (container.clientHeight - svgH) / 2;

        resetView(1, { x: cx, y: cy });
    }, [resetView]);

    if (!code.trim()) {
        return (
            <div className="h-full w-full bg-slate-50/50">
                <EmptyState
                    icon={Workflow}
                    title="Esperando diagrama..."
                    description="Pega tu código Mermaid en el panel izquierdo para ver la vista previa renderizada."
                    className="opacity-60"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
                <div className="rounded-full bg-red-50 p-4 ring-1 ring-red-200">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-medium text-slate-900">Diagrama inválido</h3>
                    <p className="text-sm text-slate-500">Revisa la sintaxis de tu código Mermaid.</p>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs font-mono text-red-700 whitespace-pre-wrap break-all">
                        {error}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden bg-white dark:bg-slate-900">
            <div
                ref={containerRef}
                className="h-full w-full cursor-grab overflow-auto active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
            >
                <div
                    ref={svgWrapRef}
                    className="inline-block origin-top-left"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    }}
                >
                    <div
                        className="mermaid-preview"
                        dangerouslySetInnerHTML={{ __html: svg ?? "" }}
                    />
                </div>
            </div>

            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
                <button
                    onClick={() => zoomBy(1 / 1.25)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Alejar"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => zoomBy(1.25)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Acercar"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
                <button
                    onClick={applyFit}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Ajustar al panel"
                >
                    <Maximize className="h-4 w-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Restablecer (100%)"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};