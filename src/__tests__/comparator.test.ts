import { compareJson, type CompareResult, type Difference } from "../services/comparator";

const differencesOf = (result: CompareResult): Difference[] => {
  if (result.status !== "success") {
    throw new Error(`Se esperaba status success, se obtuvo: ${result.error}`);
  }
  return result.differences;
};

describe("compareJson", () => {
  test("ejemplo de la spec: tipo distinto y campo ausente", () => {
    const diffs = differencesOf(compareJson('{ "id": 1, "name": "x" }', '{ "id": "1" }'));
    expect(diffs).toEqual([
      {
        path: "id",
        type: "type_mismatch",
        expected: "number",
        actual: "string",
        message: "Se esperaba number y se obtuvo string",
      },
      {
        path: "name",
        type: "missing",
        expected: "string",
        message: 'Falta el campo "name"',
      },
    ]);
  });

  test("objetos idénticos no tienen diferencias", () => {
    const json = '{ "a": 1, "b": { "c": [true, false] }, "d": null }';
    const result = compareJson(json, json);
    expect(result).toMatchObject({ status: "success", isValid: true, differences: [] });
  });

  test("campos extra en el actual", () => {
    const diffs = differencesOf(compareJson('{ "a": 1 }', '{ "a": 2, "b": "x" }'));
    expect(diffs).toEqual([
      { path: "b", type: "extra", actual: "string", message: 'Campo inesperado "b"' },
    ]);
  });

  test("null en cualquiera de los lados", () => {
    const diffs = differencesOf(
      compareJson('{ "a": null, "b": 1 }', '{ "a": "x", "b": null }'),
    );
    expect(diffs).toEqual([
      {
        path: "a",
        type: "null_mismatch",
        expected: "string",
        actual: "null",
        message: "Se esperaba null y se obtuvo string",
      },
      {
        path: "b",
        type: "null_mismatch",
        expected: "number",
        actual: "null",
        message: "Se esperaba number y se obtuvo null",
      },
    ]);
  });

  test("arrays de distinta longitud se comparan índice a índice", () => {
    const diffs = differencesOf(compareJson('{ "xs": [1] }', '{ "xs": [1, 2] }'));
    expect(diffs).toEqual([
      { path: "xs[1]", type: "extra", actual: "number", message: "Elemento extra en el índice 1" },
    ]);

    const missing = differencesOf(compareJson("[1, 2]", "[1]"));
    expect(missing).toEqual([
      { path: "[1]", type: "missing", expected: "number", message: "Falta el elemento en el índice 1" },
    ]);
  });

  test("anidamiento profundo construye rutas con puntos", () => {
    const diffs = differencesOf(
      compareJson('{ "a": { "b": { "c": 1 } } }', '{ "a": { "b": { "c": false } } }'),
    );
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ path: "a.b.c", type: "type_mismatch" });
  });

  test("genera los tipos y el schema del esperado", () => {
    const result = compareJson('{ "id": 1 }', '{ "id": 1 }');
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.expectedTs).toContain("export interface Expected");
      expect(result.expectedZod).toContain("ExpectedSchema");
    }
  });

  test("JSON inválido en el esperado o en el actual devuelve error", () => {
    expect(compareJson("{", '{ "a": 1 }').status).toBe("error");
    expect(compareJson('{ "a": 1 }', "{").status).toBe("error");
  });
});
