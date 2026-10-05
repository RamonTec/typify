interface ZodConfig {
    rootName: string;
}

const toPascalCase = (str: string): string => {
    return str
        .match(/[a-z0-9]+/gi)
        ?.map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join("") || str;
};

const toPascalCasePreserveRest = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const getZodType = (value: unknown): string => {
    if (value === null) return "z.null()";
    if (typeof value === "string") return "z.string()";
    if (typeof value === "number") return "z.number()";
    if (typeof value === "boolean") return "z.boolean()";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "z.any()";
};

export const jsonToZod = (
    jsonString: string,
    config: ZodConfig = { rootName: "Root" }
): string => {
    let parsedJson: unknown;

    try {
        parsedJson = JSON.parse(jsonString);
    } catch {
        throw new Error("JSON Inválido");
    }

    const schemas = new Map<string, string>();

    const visited = new WeakSet();

    const parseObject = (obj: unknown, name: string, isRoot = false): string => {
        if (typeof obj === "object" && obj !== null) {
            const objRef = obj as object;
            if (visited.has(objRef)) {
                return "z.any()";
            }
            visited.add(objRef);
        }

        const type = getZodType(obj);

        if (type === "array") {
            const arr = obj as unknown[];
            if (arr.length === 0) return "z.array(z.any())";

            const elementSchemas = arr.map((item) => parseObject(item, name));
            const uniqueSchemas = [...new Set(elementSchemas)];

            if (uniqueSchemas.length === 1) {
                return `z.array(${uniqueSchemas[0]})`;
            } else {
                return `z.array(z.union([${uniqueSchemas.join(", ")}]))`;
            }
        }

        if (type === "object" && obj !== null) {
            const objDict = obj as Record<string, unknown>;
            const baseName = isRoot
                ? toPascalCasePreserveRest(name)
                : toPascalCase(name);
            const schemaName = `${baseName}Schema`;

            let schemaBody = `export const ${schemaName} = z.object({\n`;

            for (const key of Object.keys(objDict)) {
                const value = objDict[key];
                const propertySchema = parseObject(value, key);

                const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

                schemaBody += `  ${validKey}: ${propertySchema},\n`;
            }

            schemaBody += `});`;

            schemaBody += `\nexport type ${baseName} = z.infer<typeof ${schemaName}>;`;

            schemas.set(schemaName, schemaBody);

            visited.delete(objDict);
            return schemaName;
        }

        if (typeof obj === "object" && obj !== null) {
            visited.delete(obj as object);
        }

        return type;
    };

    const rootSchemaRef = parseObject(parsedJson, config.rootName, true);

    const imports = `import { z } from "zod";`;
    const schemaDefinitions = Array.from(schemas.values()).reverse().join("\n\n");
    let rootExport = "";
    const rootSchemaName = `${config.rootName}Schema`;

    if (!schemas.has(rootSchemaName)) {
        rootExport = `\n\nexport const ${rootSchemaName} = ${rootSchemaRef};\nexport type ${config.rootName} = z.infer<typeof ${rootSchemaName}>;`;
    }

    return `${imports}\n\n${schemaDefinitions}${rootExport}`;
};