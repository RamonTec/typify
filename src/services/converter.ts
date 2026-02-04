
export type OutputMode = 'interface' | 'type' | 'zod';

interface ConversionConfig {
    rootName: string;
    outputMode: OutputMode;
}

const toPascalCase = (str: string): string => {
    return str
        .match(/[a-z0-9]+/gi)
        ?.map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join("") || str;
};

const getType = (value: any): string => {
    if (value === null) return "any";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "any";
};

export const jsonToTypeScript = (
    jsonString: string,
    config: ConversionConfig = { rootName: "Root", outputMode: 'interface' }
): string => {
    let parsedJson: any;

    try {
        parsedJson = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("JSON Inválido");
    }

    const interfaces = new Map<string, string>();

    const parseObject = (obj: any, name: string): string => {
        const type = getType(obj);

        if (type === "array") {
            if (obj.length === 0) return "any[]";
            const firstItemType = parseObject(obj[0], name);
            return `${firstItemType}[]`;
        }

        if (type === "object" && obj !== null) {
            const interfaceName = toPascalCase(name);

            const opening = config.outputMode === 'type'
                ? `export type ${interfaceName} = {`
                : `export interface ${interfaceName} {`;

            let interfaceBody = `${opening}\n`;

            Object.keys(obj).forEach((key) => {
                const value = obj[key];
                const propertyType = parseObject(value, key);
                const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

                interfaceBody += `  ${validKey}: ${propertyType};\n`;
            });

            interfaceBody += `}`;

            interfaces.set(interfaceName, interfaceBody);
            return interfaceName;
        }

        return type;
    };

    const rootType = parseObject(parsedJson, config.rootName);

    if (config.outputMode === 'type' && !interfaces.has(config.rootName)) {
        return [
            ...Array.from(interfaces.values()).reverse(),
            `export type ${config.rootName} = ${rootType};`
        ].join("\n\n");
    }

    return Array.from(interfaces.values()).reverse().join("\n\n");
};