import type { JavaClass, ParsedJavaFile } from "./javaParser";
import { parseJavaClass } from "./javaParser";

const tsTypeToZod = (tsType: string): string => {
    if (tsType.includes("| undefined")) {
        const baseType = tsType.replace("| undefined", "").trim();
        return `${tsTypeToZod(baseType)}.optional()`;
    }
    
    if (tsType.includes("| null")) {
        const baseType = tsType.replace("| null", "").trim();
        return `${tsTypeToZod(baseType)}.nullable()`;
    }
    
    if (tsType.endsWith("[]")) {
        const innerType = tsType.slice(0, -2);
        return `z.array(${tsTypeToZod(innerType)})`;
    }
    
    if (tsType.startsWith("Record<")) {
        const inner = tsType.slice(7, -1);
        const parts = splitGenericParts(inner);
        if (parts.length === 2) {
            return `z.record(${tsTypeToZod(parts[0])}, ${tsTypeToZod(parts[1])})`;
        }
        return `z.record(z.string(), z.any())`;
    }
    
    const typeMap: Record<string, string> = {
        "string": "z.string()",
        "number": "z.number()",
        "boolean": "z.boolean()",
        "any": "z.any()",
        "null": "z.null()",
        "undefined": "z.undefined()",
    };
    
    if (typeMap[tsType]) {
        return typeMap[tsType];
    }
    
    return `${tsType}Schema`;
};

const splitGenericParts = (str: string): string[] => {
    const result: string[] = [];
    let current = "";
    let depth = 0;
    
    for (const char of str) {
        if (char === "<") depth++;
        if (char === ">") depth--;
        if (char === "," && depth === 0) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    
    if (current.trim()) {
        result.push(current.trim());
    }
    
    return result;
};

const generateZodSchema = (javaClass: JavaClass): string[] => {
    const results: string[] = [];
    
    for (const nested of javaClass.nestedClasses) {
        results.push(...generateZodSchema(nested));
    }
    
    const schemaName = `${javaClass.name}Schema`;
    let schemaBody = `export const ${schemaName} = z.object({\n`;
    
    for (const field of javaClass.fields) {
        const zodType = tsTypeToZod(field.type);
        schemaBody += `  ${field.name}: ${zodType},\n`;
    }
    
    schemaBody += `});`;
    schemaBody += `\nexport type ${javaClass.name} = z.infer<typeof ${schemaName}>;`;
    
    results.push(schemaBody);
    
    return results;
};

export const javaToZod = (javaSource: string): string => {
    let parsed: ParsedJavaFile;
    
    try {
        parsed = parseJavaClass(javaSource);
    } catch {
        throw new Error("Error al parsear la clase Java");
    }
    
    if (parsed.classes.length === 0) {
        throw new Error("No se encontraron clases Java válidas");
    }
    
    const allSchemas: string[] = [];
    
    for (const javaClass of parsed.classes) {
        allSchemas.push(...generateZodSchema(javaClass));
    }
    
    const imports = `import { z } from "zod";`;
    const schemaDefinitions = allSchemas.join("\n\n");
    
    return `${imports}\n\n${schemaDefinitions}`;
};
