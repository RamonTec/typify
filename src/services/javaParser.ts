export interface JavaField {
    name: string;
    type: string;
    isNullable: boolean;
    isOptional: boolean;
    annotations: string[];
}

export interface JavaClass {
    name: string;
    extends?: string;
    implements?: string[];
    fields: JavaField[];
    nestedClasses: JavaClass[];
    isNested: boolean;
}

export interface ParsedJavaFile {
    packageName?: string;
    imports: string[];
    classes: JavaClass[];
}

const typeMappings: Record<string, string> = {
    String: "string",
    int: "number",
    Integer: "number",
    long: "number",
    Long: "number",
    double: "number",
    Double: "number",
    float: "number",
    Float: "number",
    BigDecimal: "number",
    BigInteger: "number",
    boolean: "boolean",
    Boolean: "boolean",
    Date: "string",
    LocalDate: "string",
    LocalDateTime: "string",
    ZonedDateTime: "string",
    Instant: "string",
    UUID: "string",
    Object: "any",
};

const mapJavaType = (type: string): string => {
    const trimmed = type.trim();
    
    if (trimmed.startsWith("Optional<") && trimmed.endsWith(">")) {
        const inner = trimmed.slice(9, -1);
        return `${mapJavaType(inner)} | undefined`;
    }
    
    if ((trimmed.startsWith("List<") && trimmed.endsWith(">")) ||
        (trimmed.startsWith("Set<") && trimmed.endsWith(">")) ||
        (trimmed.startsWith("Collection<") && trimmed.endsWith(">")) ||
        (trimmed.endsWith("[]"))) {
        const inner = trimmed.endsWith("[]") ? trimmed.slice(0, -2) : trimmed.slice(trimmed.indexOf("<") + 1, -1);
        return `${mapJavaType(inner)}[]`;
    }
    
    if (trimmed.startsWith("Map<") && trimmed.endsWith(">")) {
        const inner = trimmed.slice(4, -1);
        const parts = splitGenericParams(inner);
        if (parts.length === 2) {
            return `Record<${mapJavaType(parts[0])}, ${mapJavaType(parts[1])}>`;
        }
        return `Record<string, any>`;
    }
    
    if (typeMappings[trimmed]) {
        return typeMappings[trimmed];
    }
    
    return trimmed;
};

const splitGenericParams = (str: string): string[] => {
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

const parseAnnotations = (line: string): { annotations: string[]; isNullable: boolean; cleanedLine: string } => {
    const annotations: string[] = [];
    const annotationRegex = /@([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)(?:\([^)]*\))?/g;
    let match;
    
    while ((match = annotationRegex.exec(line)) !== null) {
        annotations.push(match[1]);
    }
    
    const isNullable = annotations.some(a => 
        a === "Nullable" || a === "javax.annotation.Nullable" || a === "org.jetbrains.annotations.Nullable"
    );
    
    const cleanedLine = line.replace(/@\w+(?:\([^)]*\))?\s*/g, "").trim();
    
    return { annotations, isNullable, cleanedLine };
};

const parseFields = (classBody: string): JavaField[] => {
    const fields: JavaField[] = [];
    const lines = classBody.split("\n");
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i].trim();
        
        if (!line || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*") || 
            line.startsWith("public") && line.includes("(") || line.startsWith("private") && line.includes("(") ||
            line.startsWith("protected") && line.includes("(")) {
            i++;
            continue;
        }
        
        let fullLine = line;
        while (!fullLine.endsWith(";") && !fullLine.includes("{") && i < lines.length - 1) {
            i++;
            fullLine += " " + lines[i].trim();
        }
        
        if (fullLine.includes("{")) {
            i++;
            continue;
        }
        
        if (fullLine.endsWith(";")) {
            fullLine = fullLine.slice(0, -1).trim();
        }
        
        const { annotations, isNullable, cleanedLine } = parseAnnotations(fullLine);
        
        const fieldMatch = cleanedLine.match(
            /^(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?([\w<>,.\s?]+?)\s+(\w+)\s*(?:=\s*.+)?$/
        );
        
        if (fieldMatch) {
            const rawType = fieldMatch[1].trim();
            const name = fieldMatch[2];
            
            const isOptionalAnnotation = annotations.some(a => a === "Optional");
            let tsType = mapJavaType(rawType);
            
            if (rawType.startsWith("Optional<") || isOptionalAnnotation) {
                if (!tsType.includes("| undefined")) {
                    tsType = `${tsType} | undefined`;
                }
            }
            
            if (isNullable && !tsType.includes("| null")) {
                tsType = `${tsType} | null`;
            }
            
            fields.push({
                name,
                type: tsType,
                isNullable,
                isOptional: rawType.startsWith("Optional<") || isOptionalAnnotation,
                annotations,
            });
        }
        
        i++;
    }
    
    return fields;
};

const extractClassBody = (content: string, startIndex: number): { body: string; endIndex: number } => {
    let depth = 0;
    let i = startIndex;
    let started = false;
    
    while (i < content.length) {
        if (content[i] === "{") {
            depth++;
            started = true;
        }
        if (content[i] === "}") {
            depth--;
            if (started && depth === 0) {
                return { body: content.slice(startIndex, i), endIndex: i };
            }
        }
        i++;
    }
    
    return { body: content.slice(startIndex), endIndex: content.length };
};

const parseClass = (content: string, offset: number, isNested: boolean = false): { javaClass: JavaClass; endIndex: number } | null => {
    const classRegex = /(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|static\s+|final\s+)*class\s+(\w+)(?:\s+extends\s+([\w<>,.\s]+?))?(?:\s+implements\s+([\w<>,.\s]+?))?\s*\{/g;
    
    classRegex.lastIndex = offset;
    const match = classRegex.exec(content);
    
    if (!match || match.index < offset) {
        return null;
    }
    
    const name = match[1];
    const extendsClause = match[2]?.trim();
    const implementsClause = match[3]?.trim();
    
    const braceIndex = match.index + match[0].length - 1;
    const { body, endIndex } = extractClassBody(content, braceIndex + 1);
    
    const fields = parseFields(body);
    
    const nestedClasses: JavaClass[] = [];
    let searchOffset = 0;
    
    while (true) {
        const nestedResult = parseClass(body, searchOffset, true);
        if (!nestedResult) break;
        nestedClasses.push(nestedResult.javaClass);
        searchOffset = nestedResult.endIndex + 1;
    }
    
    return {
        javaClass: {
            name,
            extends: extendsClause,
            implements: implementsClause ? implementsClause.split(/,\s*/).map(s => s.trim()) : undefined,
            fields,
            nestedClasses,
            isNested,
        },
        endIndex,
    };
};

export const parseJavaClass = (javaSource: string): ParsedJavaFile => {
    const result: ParsedJavaFile = {
        imports: [],
        classes: [],
    };
    
    const packageMatch = javaSource.match(/package\s+([\w.]+)\s*;/);
    if (packageMatch) {
        result.packageName = packageMatch[1];
    }
    
    const importRegex = /import\s+([\w.*]+)\s*;/g;
    let importMatch;
    while ((importMatch = importRegex.exec(javaSource)) !== null) {
        result.imports.push(importMatch[1]);
    }
    
    const codeWithoutImportsAndPackage = javaSource
        .replace(/package\s+[\w.]+\s*;/g, "")
        .replace(/import\s+[\w.*]+\s*;/g, "");
    
    let offset = 0;
    while (true) {
        const classResult = parseClass(codeWithoutImportsAndPackage, offset);
        if (!classResult) break;
        result.classes.push(classResult.javaClass);
        offset = classResult.endIndex + 1;
    }
    
    return result;
};
