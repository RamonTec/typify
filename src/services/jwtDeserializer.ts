import { jsonToZod } from "./zodGenerator";

interface JwtDeserializerConfig {
    rootName?: string;
}

const decodeJwtPayloadFromString = (token: string): string => {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid JWT");
    }
    const base64 = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return atob(base64 + padding);
};

export const generateJwtDeserializer = (
    payloadJson: string,
    config: JwtDeserializerConfig = {}
): string => {
    const rootName = config.rootName ?? "JwtPayload";
    const schemaName = `${rootName}Schema`;

    const zodOutput = jsonToZod(payloadJson, { rootName });

    const deserializerBlock = `

const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return atob(base64 + padding);
};

export function deserializeJwt(token: string): ${rootName} {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  return ${schemaName}.parse(JSON.parse(base64UrlDecode(parts[1])));
}
`;

    return `${zodOutput}${deserializerBlock}`;
};

export const deserializeJwt = (token: string): unknown => {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid JWT");
    }
    return JSON.parse(decodeJwtPayloadFromString(token));
};