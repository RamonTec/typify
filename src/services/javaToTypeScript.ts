import type { JavaClass, ParsedJavaFile } from "./javaParser";
import { parseJavaClass } from "./javaParser";

export type JavaOutputMode = "interface" | "type";

interface JavaConversionConfig {
    outputMode: JavaOutputMode;
}

const generateInterface = (javaClass: JavaClass, config: JavaConversionConfig): string => {
    const opening = config.outputMode === "type"
        ? `export type ${javaClass.name} = {`
        : `export interface ${javaClass.name} {`;
    
    let body = `${opening}\n`;
    
    for (const field of javaClass.fields) {
        const optionalMarker = field.isOptional ? "?" : "";
        body += `  ${field.name}${optionalMarker}: ${field.type};\n`;
    }
    
    body += `}`;
    
    if (javaClass.extends || (javaClass.implements && javaClass.implements.length > 0)) {
        const parents = [];
        if (javaClass.extends) parents.push(javaClass.extends);
        if (javaClass.implements) parents.push(...javaClass.implements);
        
        const extendsClause = `extends ${parents.join(", ")}`;
        body = body.replace(
            config.outputMode === "type" ? `export type ${javaClass.name} = {` : `export interface ${javaClass.name} {`,
            config.outputMode === "type"
                ? `export type ${javaClass.name} = ${parents.join(" & ")} & {`
                : `export interface ${javaClass.name} ${extendsClause} {`
        );
    }
    
    return body;
};

const generateAllInterfaces = (javaClass: JavaClass, config: JavaConversionConfig): string[] => {
    const results: string[] = [];
    
    for (const nested of javaClass.nestedClasses) {
        results.push(...generateAllInterfaces(nested, config));
    }
    
    results.push(generateInterface(javaClass, config));
    
    return results;
};

export const javaToTypeScript = (
    javaSource: string,
    config: JavaConversionConfig = { outputMode: "interface" }
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
    
    const allInterfaces: string[] = [];
    
    for (const javaClass of parsed.classes) {
        allInterfaces.push(...generateAllInterfaces(javaClass, config));
    }
    
    return allInterfaces.join("\n\n");
};
