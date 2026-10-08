import {
  generate,
  isLargeInput,
  LARGE_INPUT_CHARS,
  resolveOutputMode,
  SUPPORTED_OUTPUTS,
  type InputKind,
} from "../services/generate";
import type { OutputMode } from "../services/converter";
import type { MermaidDiagram } from "../services/mermaidGenerator";
import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";
import { jsonToMermaid } from "../services/mermaidGenerator";
import { javaToMermaid } from "../services/javaToMermaid";
import { javaToTypeScript } from "../services/javaToTypeScript";
import { javaToZod } from "../services/javaToZod";
import { generateJsonDeserializer } from "../services/jsonDeserializer";
import { generateJwtDeserializer } from "../services/jwtDeserializer";
import { decodeJwtPayload } from "../services/jwtDecoder";

// Oráculo: copia literal de la tabla de decisión del useEffect de App.tsx (líneas 142-183)
// antes de la feature 002. Si este bloque cambia, deja de medir la paridad.
const legacyOutput = (
  jsonInput: string,
  inputMode: InputKind,
  outputMode: OutputMode,
  mermaidType: MermaidDiagram,
): string => {
  let result = "";

  if (inputMode === "java") {
    if (outputMode === "mermaid") {
      result = javaToMermaid(jsonInput, { diagram: mermaidType });
    } else if (outputMode === "zod") {
      result = javaToZod(jsonInput);
    } else {
      const javaMode = outputMode === "type" ? "type" : "interface";
      result = javaToTypeScript(jsonInput, { outputMode: javaMode });
    }
  } else if (inputMode === "jwt") {
    const decoded = decodeJwtPayload(jsonInput);
    if (decoded.valid) {
      if (outputMode === "mermaid") {
        result = jsonToMermaid(decoded.payload, { diagram: mermaidType, rootName: "JwtPayload" });
      } else if (outputMode === "deserialize") {
        result = generateJwtDeserializer(decoded.payload);
      } else if (outputMode === "zod") {
        result = jsonToZod(decoded.payload, { rootName: "JwtPayload" });
      } else {
        const tsMode = outputMode === "type" ? "type" : "interface";
        result = jsonToTypeScript(decoded.payload, {
          rootName: "JwtPayload",
          outputMode: tsMode,
        });
      }
    }
  } else {
    if (outputMode === "mermaid") {
      result = jsonToMermaid(jsonInput, { diagram: mermaidType });
    } else if (outputMode === "deserialize") {
      result = generateJsonDeserializer(jsonInput);
    } else if (outputMode === "zod") {
      result = jsonToZod(jsonInput, { rootName: "Root" });
    } else {
      const tsMode = outputMode === "type" ? "type" : "interface";
      result = jsonToTypeScript(jsonInput, {
        rootName: "Root",
        outputMode: tsMode,
      });
    }
  }

  return result;
};

const base64Url = (text: string): string =>
  Buffer.from(text, "utf8").toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

const makeJwt = (payloadJson: string): string =>
  `${base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${base64Url(payloadJson)}.firma`;

const JSON_FIXTURES: Record<string, string> = {
  plano: '{ "id": 1, "name": "Ana", "active": true, "score": 9.5 }',
  anidado: JSON.stringify({
    order: { id: "A-1", items: [{ sku: "X", qty: 2 }, { sku: "Y", qty: 1 }] },
    customer: { name: "Ana", address: { city: "Madrid", zip: "28001" } },
  }),
  arrayRaiz: '[{ "id": 1, "tags": ["a", "b"] }, { "id": 2, "tags": [] }]',
  clavesEspeciales: '{ "user-name": "ana", "2fa": false, "con espacio": 1, "ñandú": "sí" }',
  nulos: '{ "id": 1, "meta": null, "list": [null, 1], "nested": { "x": null } }',
};

const JAVA_FIXTURES: Record<string, string> = {
  plano: `
public class User {
  private Long id;
  private String name;
  private boolean active;
  private double score;
}`,
  anidado: `
public class Order {
  private String id;
  private List<Item> items;
  private Customer customer;

  public static class Item {
    private String sku;
    private int qty;
  }
}
public class Customer {
  private String name;
}`,
  colecciones: `
public class Catalog {
  private List<String> tags;
  private Map<String, Integer> stock;
  private Optional<String> note;
}`,
  anotaciones: `
@Data
@Entity
public class Product {
  @Id
  private Long id;
  @JsonProperty("product_name")
  private String name;
  private BigDecimal price;
}`,
  herencia: `
public class Admin extends User {
  private String role;
}
public class User {
  private String email;
}`,
};

const JWT_FIXTURES: Record<string, string> = Object.fromEntries(
  Object.entries(JSON_FIXTURES).map(([name, json]) => [name, makeJwt(json)]),
);

const FIXTURES: Record<InputKind, Record<string, string>> = {
  json: JSON_FIXTURES,
  java: JAVA_FIXTURES,
  jwt: JWT_FIXTURES,
};

const DIAGRAMS: MermaidDiagram[] = ["class", "er", "flow"];

const combinations = (kind: InputKind): Array<{ mode: OutputMode; diagram: MermaidDiagram }> =>
  SUPPORTED_OUTPUTS[kind].flatMap((mode) =>
    mode === "mermaid"
      ? DIAGRAMS.map((diagram) => ({ mode, diagram }))
      : [{ mode, diagram: "class" as MermaidDiagram }],
  );

describe("SUPPORTED_OUTPUTS", () => {
  test("JSON y JWT soportan las 5 salidas; Java no tiene deserializador", () => {
    expect(SUPPORTED_OUTPUTS.json).toEqual(["interface", "type", "zod", "mermaid", "deserialize"]);
    expect(SUPPORTED_OUTPUTS.java).toEqual(["interface", "type", "zod", "mermaid"]);
    expect(SUPPORTED_OUTPUTS.jwt).toEqual(["interface", "type", "zod", "mermaid", "deserialize"]);
  });

  test("ninguna entrada ofrece 'compare'", () => {
    for (const modes of Object.values(SUPPORTED_OUTPUTS)) {
      expect(modes).not.toContain("compare");
    }
  });

  test("la matriz tiene 20 combinaciones por fixture", () => {
    const total = (["json", "java", "jwt"] as InputKind[])
      .map((kind) => combinations(kind).length)
      .reduce((a, b) => a + b, 0);
    expect(total).toBe(20);
  });
});

describe("resolveOutputMode", () => {
  test("conserva una salida soportada", () => {
    expect(resolveOutputMode("json", "deserialize")).toBe("deserialize");
    expect(resolveOutputMode("java", "zod")).toBe("zod");
  });

  test("cae en la primera salida soportada si no lo está", () => {
    expect(resolveOutputMode("java", "deserialize")).toBe("interface");
  });
});

describe("generate — paridad con la versión anterior", () => {
  for (const kind of ["json", "java", "jwt"] as InputKind[]) {
    for (const [fixtureName, input] of Object.entries(FIXTURES[kind])) {
      for (const { mode, diagram } of combinations(kind)) {
        const label = mode === "mermaid" ? `${mode}/${diagram}` : mode;
        test(`${kind} · ${fixtureName} · ${label}`, () => {
          const expected = legacyOutput(input, kind, mode, diagram);
          expect(expected).not.toBe("");
          expect(generate(input, kind, mode, { diagram })).toEqual({ ok: true, output: expected });
        });
      }
    }
  }

  test("Java con 'deserialize' genera lo mismo que antes (una Interface)", () => {
    const input = JAVA_FIXTURES.plano;
    expect(generate(input, "java", "deserialize", { diagram: "class" })).toEqual({
      ok: true,
      output: legacyOutput(input, "java", "deserialize", "class"),
    });
  });
});

describe("generate — entradas vacías e inválidas", () => {
  test.each(["json", "java", "jwt"] as InputKind[])("%s vacío o solo espacios → salida vacía", (kind) => {
    expect(generate("", kind, "interface", { diagram: "class" })).toEqual({ ok: true, output: "" });
    expect(generate("  \n\t", kind, "zod", { diagram: "class" })).toEqual({ ok: true, output: "" });
  });

  test("JSON inválido → error, sin lanzar", () => {
    const result = generate('{ "a": ', "json", "interface", { diagram: "class" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("JSON Inválido");
  });

  test("Java sin clases → error, sin lanzar", () => {
    const result = generate("esto no es java", "java", "interface", { diagram: "class" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).not.toBe("");
  });

  test("JWT mal formado → error con el motivo del decodificador", () => {
    const result = generate("abc.def", "jwt", "interface", { diagram: "class" });
    expect(result).toEqual({
      ok: false,
      error: 'Token inválido: se esperaban 3 partes separadas por ".", se encontraron 2',
    });
  });
});

describe("isLargeInput", () => {
  test("el umbral es 100 KB", () => {
    expect(LARGE_INPUT_CHARS).toBe(100 * 1024);
  });

  test("hasta el umbral no es grande; por encima, sí", () => {
    expect(isLargeInput("")).toBe(false);
    expect(isLargeInput("x".repeat(LARGE_INPUT_CHARS))).toBe(false);
    expect(isLargeInput("x".repeat(LARGE_INPUT_CHARS + 1))).toBe(true);
  });
});
