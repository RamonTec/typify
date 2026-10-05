export type MermaidDiagram = 'class' | 'er' | 'flow';

export interface MermaidConfig {
    diagram: MermaidDiagram;
    rootName?: string;
}

interface FieldDef {
    name: string;
    type: string;
    isArray: boolean;
    isObject: boolean;
}

interface NodeDef {
    name: string;
    fields: FieldDef[];
}

const toPascalCase = (str: string): string => {
    return (
        str
            .match(/[a-z0-9]+/gi)
            ?.map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
            .join("") || str
    );
};

const toPascalCasePreserveRest = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const sanitizeMermaidId = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9_]/g, "_");
};

const mermaidQuote = (str: string): string => {
    return `"${str.replace(/"/g, "&quot;").replace(/\n/g, " ")}"`;
};

const deduplicateName = (base: string, used: Set<string>): string => {
    if (!used.has(base)) {
        used.add(base);
        return base;
    }
    let i = 1;
    while (used.has(`${base}${i}`)) i++;
    const unique = `${base}${i}`;
    used.add(unique);
    return unique;
};

const getKind = (value: unknown): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return typeof value;
};

const jsonTypeToString = (value: unknown): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
};

const buildNodes = (
    parsedJson: unknown,
    rootName: string,
    nodes: NodeDef[],
    usedNames: Set<string>,
    visited: WeakSet<object>
): NodeDef => {
    const root: NodeDef = {
        name: deduplicateName(toPascalCasePreserveRest(rootName), usedNames),
        fields: [],
    };
    nodes.push(root);

    const walk = (val: unknown, fieldName: string, parent: NodeDef): void => {
        const kind = getKind(val);

        if (kind === "object") {
            const obj = val as Record<string, unknown>;
            if (visited.has(obj)) {
                parent.fields.push({
                    name: fieldName,
                    type: parent.name,
                    isArray: false,
                    isObject: true,
                });
                return;
            }
            visited.add(obj);

            const childName = deduplicateName(toPascalCase(fieldName || "Root"), usedNames);
            const childNode: NodeDef = { name: childName, fields: [] };
            nodes.push(childNode);

            parent.fields.push({
                name: fieldName,
                type: childName,
                isArray: false,
                isObject: true,
            });

            for (const key of Object.keys(obj)) {
                walk(obj[key], key, childNode);
            }

            visited.delete(obj);
            return;
        }

        if (kind === "array") {
            const arr = val as unknown[];
            if (arr.length === 0) {
                parent.fields.push({
                    name: fieldName,
                    type: "any[]",
                    isArray: true,
                    isObject: false,
                });
                return;
            }

            const first = arr[0];
            const firstKind = getKind(first);

            if (firstKind === "object") {
                const childName = deduplicateName(
                    toPascalCase(fieldName.replace(/s$/i, "") || fieldName || "Item"),
                    usedNames
                );
                const childNode: NodeDef = { name: childName, fields: [] };
                nodes.push(childNode);

                parent.fields.push({
                    name: fieldName,
                    type: childName,
                    isArray: true,
                    isObject: true,
                });

                const seenObjs = new WeakSet<object>();
                seenObjs.add(first as object);

                for (const key of Object.keys(first as Record<string, unknown>)) {
                    walk((first as Record<string, unknown>)[key], key, childNode);
                }
                return;
            }

            const elementTypes = new Set(arr.map((item) => jsonTypeToString(item)));
            const typeStr = Array.from(elementTypes).join(" | ");
            parent.fields.push({
                name: fieldName,
                type: `${typeStr}[]`,
                isArray: true,
                isObject: false,
            });
            return;
        }

        if (kind === "null") {
            parent.fields.push({
                name: fieldName,
                type: "null",
                isArray: false,
                isObject: false,
            });
            return;
        }

        parent.fields.push({
            name: fieldName,
            type: kind,
            isArray: false,
            isObject: false,
        });
    };

    if (parsedJson !== null && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
        const obj = parsedJson as Record<string, unknown>;
        visited.add(obj);
        for (const key of Object.keys(obj)) {
            walk(obj[key], key, root);
        }
        visited.delete(obj);
    } else if (Array.isArray(parsedJson)) {
        walk(parsedJson, "items", root);
    } else {
        root.fields.push({
            name: "value",
            type: jsonTypeToString(parsedJson),
            isArray: false,
            isObject: false,
        });
    }

    return root;
};

const renderClassDiagram = (nodes: NodeDef[]): string => {
    const lines: string[] = ["classDiagram"];

    for (const node of nodes) {
        lines.push(`    class ${node.name} {`);
        for (const field of node.fields) {
            const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name.replace(/"/g, '\\"')}"`;
            const typeLabel = field.isObject ? field.type : inferPrimitiveType(field.type);
            lines.push(`        +${safeName} : ${typeLabel}${field.isArray ? "[]" : ""}`);
        }
        lines.push(`    }`);
    }

    for (const node of nodes) {
        for (const field of node.fields) {
            if (!field.isObject) continue;
            const target = field.type;
            const cardinality = field.isArray ? `"1" --> "0..*"` : `"1" --> "1"`;
            const safeField = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name}"`;
            lines.push(`    ${node.name} ${cardinality} ${target} : ${safeField}`);
        }
    }

    return lines.join("\n");
};

const renderErDiagram = (nodes: NodeDef[]): string => {
    const lines: string[] = ["erDiagram"];
    const upper = (s: string) => s.toUpperCase();

    for (const node of nodes) {
        lines.push(`    ${upper(node.name)} {`);
        for (const field of node.fields) {
            if (field.isObject) continue;
            const sampleType = inferPrimitiveType(field.type);
            const type = field.isArray
                ? `${sampleType}`
                : sampleType;
            const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field.name)
                ? field.name
                : `"${field.name}"`;
            const typeStr = field.isArray ? `${type}` : type;
            lines.push(`        ${typeStr} ${safeName}${field.isArray ? "[]" : ""}`);
        }
        lines.push(`    }`);
    }

    for (const node of nodes) {
        for (const field of node.fields) {
            if (!field.isObject) continue;
            const from = upper(node.name);
            const to = upper(field.type);
            const rel = field.isArray ? "||--o{" : "||--||";
            const label = sanitizeMermaidId(field.name);
            lines.push(`    ${from} ${rel} ${to} : ${label}`);
        }
    }

    return lines.join("\n");
};

const inferPrimitiveType = (type: string): string => {
    if (type === "number") return "int";
    if (type === "string") return "string";
    if (type === "boolean") return "boolean";
    return "string";
};

const renderFlowchart = (nodes: NodeDef[]): string => {
    const lines: string[] = ["flowchart TD"];

    if (nodes.length === 0) {
        return lines.join("\n");
    }

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

    if (declared.size === 0) {
        const only = nodes[0];
        lines.push(`    ${sanitizeMermaidId(only.name)}[${mermaidQuote(only.name)}]`);
        return lines.join("\n");
    }

    for (const node of nodes) {
        if (!declared.has(node.name)) continue;
        lines.push(
            `    ${sanitizeMermaidId(node.name)}[${mermaidQuote(node.name)}]`
        );
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

export const jsonToMermaid = (
    jsonString: string,
    config: MermaidConfig
): string => {
    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(jsonString);
    } catch {
        throw new Error("JSON Inválido");
    }

    const nodes: NodeDef[] = [];
    const usedNames = new Set<string>();
    const visited = new WeakSet<object>();

    buildNodes(parsedJson, config.rootName ?? "Root", nodes, usedNames, visited);

    switch (config.diagram) {
        case "class":
            return renderClassDiagram(nodes);
        case "er":
            return renderErDiagram(nodes);
        case "flow":
            return renderFlowchart(nodes);
        default:
            return renderClassDiagram(nodes);
    }
};