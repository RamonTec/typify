export type ToolId = "generate" | "compare" | "jwt" | "mermaid";

export interface ToolMeta {
    id: ToolId;
    label: string;
    description: string;
}

export const TOOL_CATALOG: readonly ToolMeta[] = [
    {
        id: "generate",
        label: "Generar tipos",
        description: "Convierte JSON, clases Java o JWT en TypeScript, Zod, Mermaid o deserializadores.",
    },
    {
        id: "compare",
        label: "Comparar",
        description: "Compara un JSON esperado con el real y detecta diferencias de estructura.",
    },
    {
        id: "jwt",
        label: "JWT",
        description: "Decodifica un token JWT y muestra su cabecera, sus claims y su payload.",
    },
    {
        id: "mermaid",
        label: "Vista previa Mermaid",
        description: "Renderiza un diagrama Mermaid con zoom y ajuste al panel.",
    },
];

export const DEFAULT_TOOL_ID: ToolId = "generate";
