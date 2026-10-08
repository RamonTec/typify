import { compareEmptyMessage } from "../tools/compare/compareMessages";

describe("compareEmptyMessage", () => {
  test("ambas vacías: pide los dos JSON", () => {
    const message = compareEmptyMessage("", "");
    expect(message).not.toBeNull();
    expect(message?.description).toMatch(/^Pega el JSON esperado y el actual/);
  });

  test("falta el esperado", () => {
    expect(compareEmptyMessage("", '{ "a": 1 }')?.title).toBe("Falta el JSON esperado");
  });

  test("falta el actual", () => {
    expect(compareEmptyMessage('{ "a": 1 }', "")?.title).toBe("Falta el JSON actual");
  });

  test("ambas con contenido: sin mensaje", () => {
    expect(compareEmptyMessage('{ "a": 1 }', '{ "a": 2 }')).toBeNull();
  });

  test("solo espacios cuenta como vacío", () => {
    expect(compareEmptyMessage("  \n", '{ "a": 1 }')?.title).toBe("Falta el JSON esperado");
    expect(compareEmptyMessage('{ "a": 1 }', "\t")?.title).toBe("Falta el JSON actual");
    expect(compareEmptyMessage(" ", " ")?.description).toMatch(/^Pega el JSON esperado y el actual/);
  });
});
