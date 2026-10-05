import type { JavaClass, ParsedJavaFile } from "./javaParser";
import { parseJavaClass } from "./javaParser";
import type { MermaidConfig } from "./mermaidGenerator";

interface JavaFieldShape {
    name: string;
    type: string;
    isArray: boolean;
    isObject: boolean;
    isOptional: boolean;
    isNullable: boolean;
}

interface JavaNodeDef {
    name: string;
    fields: JavaFieldShape[];
    extends?: string;
    implements?: string[];
}

const JAVA_PRIMITIVES = new Set([
    "string",
    "number",
    "boolean",
    "any",
    "null",
    "undefined",
]);

const stripNullable = (type: string): string => {
    return type
        .replace(/\s*\|\s*undefined/g, "")
        .replace(/\s*\|\s*null/g, "")
        .trim();
};

const parseJavaType = (
    rawType: string,
    knownClasses: Map<string, JavaNodeDef>
): { type: string; isArray: boolean; isObject: boolean } => {
    let t = stripNullable(rawType);

    let isArray = false;
    if (t.endsWith("[]")) {
        isArray = true;
        t = t.slice(0, -2).trim();
    }

    const listMatch = t.match(/(?:^|\.)(?:List|Set|Collection)<(.+)>$/);
    if (listMatch) {
        isArray = true;
        t = listMatch[1].trim();
    }

    const simpleType = t.split("<")[0].split(".").pop() ?? t;

    let isObject =
        !JAVA_PRIMITIVES.has(simpleType) &&
        !simpleType.includes("<") &&
        !t.startsWith("Record<");

    if (isObject && !knownClasses.has(simpleType) && !knownClasses.has(t)) {
        isObject = false;
    }

    return { type: isObject ? simpleType : simpleType, isArray, isObject };
};

const buildJavaNodes = (
    javaClass: JavaClass,
    nodes: JavaNodeDef[],
    knownClasses: Map<string, JavaNodeDef>
): void => {
    const node: JavaNodeDef = {
        name: javaClass.name,
        fields: [],
        extends: javaClass.extends,
        implements: javaClass.implements,
    };
    nodes.push(node);

    for (const field of javaClass.fields) {
        const { type, isArray, isObject } = parseJavaType(field.type, knownClasses);
        node.fields.push({
            name: field.name,
            type,
            isArray,
            isObject,
            isOptional: field.isOptional,
            isNullable: field.isNullable,
        });
    }

    for (const nested of javaClass.nestedClasses) {
        buildJavaNodes(nested, nodes, knownClasses);
    }
};

const sanitizeMermaidId = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9_]/g, "_");
};

const mermaidQuote = (str: string): string => {
    return `"${str.replace(/"/g, "&quot;").replace(/\n/g, " ")}"`;
};

const renderJavaClassDiagram = (nodes: JavaNodeDef[]): string => {
    const lines: string[] = ["classDiagram"];

    for (const node of nodes) {
        lines.push(`    class ${node.name} {`);
        for (const field of node.fields) {
            const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name.replace(/"/g, '\\"')}"`;
            const optMarker = field.isOptional ? "?" : "";
            lines.push(
                `        +${safeName}${optMarker} : ${field.type}${field.isArray ? "[]" : ""}`
            );
        }
        lines.push(`    }`);
    }

    for (const node of nodes) {
        if (node.extends) {
            lines.push(`    ${node.extends} <|-- ${node.name}`);
        }
        if (node.implements) {
            for (const iface of node.implements) {
                const ifaceName = iface.split("<")[0].trim();
                lines.push(`    ${ifaceName} <|.. ${node.name}`);
            }
        }
        for (const field of node.fields) {
            if (!field.isObject) continue;
            const cardinality = field.isArray ? `"1" --> "0..*"` : `"1" --> "1"`;
            const safeField = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name}"`;
            lines.push(`    ${node.name} ${cardinality} ${field.type} : ${safeField}`);
        }
    }

    return lines.join("\n");
};

const renderJavaErDiagram = (nodes: JavaNodeDef[]): string => {
    const lines: string[] = ["erDiagram"];

    const fieldTypeToEr = (type: string): string => {
        if (type === "number") return "int";
        if (type === "string") return "string";
        if (type === "boolean") return "boolean";
        return "string";
    };

    for (const node of nodes) {
        lines.push(`    ${node.name.toUpperCase()} {`);
        for (const field of node.fields) {
            if (field.isObject) continue;
            const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name}"`;
            lines.push(`        ${fieldTypeToEr(field.type)} ${safeName}`);
        }
        lines.push(`    }`);
    }

    for (const node of nodes) {
        for (const field of node.fields) {
            if (!field.isObject) continue;
            const rel = field.isArray ? "||--o{" : "||--||";
            lines.push(
                `    ${node.name.toUpperCase()} ${rel} ${field.type.toUpperCase()} : ${sanitizeMermaidId(field.name)}`
            );
        }
    }

    return lines.join("\n");
};

const renderJavaFlowchart = (nodes: JavaNodeDef[]): string => {
    const lines: string[] = ["flowchart TD"];

    const referenced = new Set<string>();
    for (const node of nodes) {
        for (const field of node.fields) {
            if (field.isObject) referenced.add(field.type);
        }
    }

    const declared = new Set<string>();
    for (const node of nodes) {
        if (referenced.has(node.name) || node.fields.some((f) => f.isObject)) {
            declared.add(node.name);
        }
    }

    if (declared.size === 0 && nodes.length > 0) {
        const only = nodes[0];
        lines.push(`    ${sanitizeMermaidId(only.name)}[${mermaidQuote(only.name)}]`);
        return lines.join("\n");
    }

    for (const node of nodes) {
        if (!declared.has(node.name)) continue;
        lines.push(`    ${sanitizeMermaidId(node.name)}[${mermaidQuote(node.name)}]`);
    }

    for (const node of nodes) {
        for (const field of node.fields) {
            if (!field.isObject) continue;
            const from = sanitizeMermaidId(node.name);
            const to = sanitizeMermaidId(field.type);
            const label = field.isArray ? `${field.name}[]` : field.name;
            lines.push(`    ${from} -->|${sanitizeMermaidId(label)}| ${to}`);
        }
    }

    return lines.join("\n");
};

export const javaToMermaid = (
    javaSource: string,
    config: MermaidConfig
): string => {
    let parsed: ParsedJavaFile;
    try {
        parsed = parseJavaClass(javaSource);
    } catch {
        throw new Error("Error al parsear la clase Java");
    }

    if (parsed.classes.length === 0) {
        throw new Error("No se encontraron clases Java válidas");
    }

    const knownClasses = new Map<string, JavaNodeDef>();

    for (const cls of parsed.classes) {
        const collect = (c: JavaClass): void => {
            knownClasses.set(c.name, { name: c.name, fields: [] });
            for (const nested of c.nestedClasses) collect(nested);
        };
        collect(cls);
    }

    const nodes: JavaNodeDef[] = [];
    for (const cls of parsed.classes) {
        buildJavaNodes(cls, nodes, knownClasses);
    }

    switch (config.diagram) {
        case "class":
            return renderJavaClassDiagram(nodes);
        case "er":
            return renderJavaErDiagram(nodes);
        case "flow":
            return renderJavaFlowchart(nodes);
        default:
            return renderJavaClassDiagram(nodes);
    }
};