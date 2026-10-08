import { DEFAULT_TOOL_ID, TOOL_CATALOG } from "../tools/catalog";

describe("TOOL_CATALOG", () => {
  test("contiene las 4 herramientas en el orden de navegación", () => {
    expect(TOOL_CATALOG.map((tool) => tool.id)).toEqual(["generate", "compare", "jwt", "mermaid"]);
  });

  test("los ids son únicos", () => {
    const ids = TOOL_CATALOG.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("cada herramienta tiene nombre y descripción", () => {
    for (const tool of TOOL_CATALOG) {
      expect(tool.label.trim()).not.toBe("");
      expect(tool.description.trim()).not.toBe("");
    }
  });

  test("los nombres visibles son los de la spec", () => {
    expect(TOOL_CATALOG.map((tool) => tool.label)).toEqual([
      "Generar tipos",
      "Comparar",
      "JWT",
      "Vista previa Mermaid",
    ]);
  });

  test("la herramienta por defecto es Generar tipos y existe en el catálogo", () => {
    expect(DEFAULT_TOOL_ID).toBe("generate");
    expect(TOOL_CATALOG.some((tool) => tool.id === DEFAULT_TOOL_ID)).toBe(true);
  });
});
