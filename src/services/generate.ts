import { jsonToTypeScript, type OutputMode } from "./converter";
import { jsonToZod } from "./zodGenerator";
import { jsonToMermaid, type MermaidDiagram } from "./mermaidGenerator";
import { javaToMermaid } from "./javaToMermaid";
import { javaToTypeScript } from "./javaToTypeScript";
import { javaToZod } from "./javaToZod";
import { generateJsonDeserializer } from "./jsonDeserializer";
import { generateJwtDeserializer } from "./jwtDeserializer";
import { decodeJwtPayload } from "./jwtDecoder";

export type InputKind = "json" | "java" | "jwt";

export const SUPPORTED_OUTPUTS = {
    json: ["interface", "type", "zod", "mermaid", "deserialize"],
    java: ["interface", "type", "zod", "mermaid"],
    jwt: ["interface", "type", "zod", "mermaid", "deserialize"],
} as const satisfies Record<InputKind, readonly OutputMode[]>;

export interface GenerateOptions {
    diagram: MermaidDiagram;
}

export type GenerateResult =
    | { ok: true; output: string }
    | { ok: false; error: string };

export const LARGE_INPUT_CHARS = 100 * 1024;

export const isLargeInput = (text: string): boolean => text.length > LARGE_INPUT_CHARS;

export const resolveOutputMode = (kind: InputKind, mode: OutputMode): OutputMode => {
    const supported: readonly OutputMode[] = SUPPORTED_OUTPUTS[kind];
    return supported.includes(mode) ? mode : supported[0];
};

const fromJson = (json: string, mode: OutputMode, options: GenerateOptions): string => {
    switch (mode) {
        case "mermaid":
            return jsonToMermaid(json, { diagram: options.diagram });
        case "deserialize":
            return generateJsonDeserializer(json);
        case "zod":
            return jsonToZod(json, { rootName: "Root" });
        default:
            return jsonToTypeScript(json, {
                rootName: "Root",
                outputMode: mode === "type" ? "type" : "interface",
            });
    }
};

const fromJava = (source: string, mode: OutputMode, options: GenerateOptions): string => {
    switch (mode) {
        case "mermaid":
            return javaToMermaid(source, { diagram: options.diagram });
        case "zod":
            return javaToZod(source);
        default:
            return javaToTypeScript(source, { outputMode: mode === "type" ? "type" : "interface" });
    }
};

const fromJwtPayload = (payload: string, mode: OutputMode, options: GenerateOptions): string => {
    switch (mode) {
        case "mermaid":
            return jsonToMermaid(payload, { diagram: options.diagram, rootName: "JwtPayload" });
        case "deserialize":
            return generateJwtDeserializer(payload);
        case "zod":
            return jsonToZod(payload, { rootName: "JwtPayload" });
        default:
            return jsonToTypeScript(payload, {
                rootName: "JwtPayload",
                outputMode: mode === "type" ? "type" : "interface",
            });
    }
};

export const generate = (
    input: string,
    kind: InputKind,
    mode: OutputMode,
    options: GenerateOptions,
): GenerateResult => {
    if (!input.trim()) return { ok: true, output: "" };

    const resolvedMode = resolveOutputMode(kind, mode);

    try {
        if (kind === "java") {
            return { ok: true, output: fromJava(input, resolvedMode, options) };
        }
        if (kind === "jwt") {
            const decoded = decodeJwtPayload(input);
            if (!decoded.valid) {
                return { ok: false, error: decoded.error ?? "Token inválido" };
            }
            return { ok: true, output: fromJwtPayload(decoded.payload, resolvedMode, options) };
        }
        return { ok: true, output: fromJson(input, resolvedMode, options) };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
};
