interface ZodConfig {
    rootName: string;
}

const toPascalCase = (str: string): string => {
    return str
        .match(/[a-z0-9]+/gi)
        ?.map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join("") || str;
};

const getZodType = (value: any): string => {
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
    let parsedJson: any;

    try {
        parsedJson = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("JSON Inválido");
    }

    const schemas = new Map<string, string>();

    const parseObject = (obj: any, name: string): string => {
        const type = getZodType(obj);

        if (type === "array") {
            if (obj.length === 0) return "z.array(z.any())";
            const firstItemSchema = parseObject(obj[0], name);
            return `z.array(${firstItemSchema})`;
        }

        if (type === "object" && obj !== null) {
            const baseName = toPascalCase(name);
            const schemaName = `${baseName}Schema`;

            let schemaBody = `export const ${schemaName} = z.object({\n`;

            Object.keys(obj).forEach((key) => {
                const value = obj[key];
                const propertySchema = parseObject(value, key);

                const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

                schemaBody += `  ${validKey}: ${propertySchema},\n`;
            });

            schemaBody += `});`;

            schemaBody += `\nexport type ${baseName} = z.infer<typeof ${schemaName}>;`;

            schemas.set(schemaName, schemaBody);
            return schemaName;
        }

        return type;
    };

    const rootSchemaRef = parseObject(parsedJson, config.rootName);

    const imports = `import { z } from "zod";`;
    const schemaDefinitions = Array.from(schemas.values()).reverse().join("\n\n");
    let rootExport = "";
    const rootSchemaName = `${config.rootName}Schema`;

    if (!schemas.has(rootSchemaName)) {
        rootExport = `\n\nexport const ${rootSchemaName} = ${rootSchemaRef};\nexport type ${config.rootName} = z.infer<typeof ${rootSchemaName}>;`;
    }

    return `${imports}\n\n${schemaDefinitions}${rootExport}`;
};