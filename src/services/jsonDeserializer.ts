import { jsonToZod } from "./zodGenerator";

interface JsonDeserializerConfig {
    rootName: string;
}

export const generateJsonDeserializer = (
    jsonString: string,
    config: JsonDeserializerConfig = { rootName: "Root" }
): string => {
    const zodOutput = jsonToZod(jsonString, { rootName: config.rootName });

    const functionsBlock = `
export function parseJson(input: string): ${config.rootName} {
  return ${config.rootName}Schema.parse(JSON.parse(input));
}

export function safeParseJson(input: string) {
  return ${config.rootName}Schema.safeParse(JSON.parse(input));
}
`;

    return `${zodOutput}\n${functionsBlock.trimStart()}`;
};