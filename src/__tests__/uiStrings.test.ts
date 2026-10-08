import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { DIFF_LABELS } from "../services/comparator";

const SRC = join(__dirname, "..");

const listTsx = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : listTsx(path);
    return path.endsWith(".tsx") ? [path] : [];
  });

// Textos en inglés de AC-7.2 y los detectados al implementar. Frases completas para no chocar
// con términos técnicos que se mantienen (Interface, Type, Zod Schema, JSON, JWT, Mermaid, ER).
const FORBIDDEN = [
  "Input", "Output", "Preview", "Undo", "Redo", "Export", "Import",
  "Copy to Clipboard", "Download as", "Choose JSON file", "From File", "From URL",
  "Expected DTO", "Actual Payload", "Waiting for inputs", "Expired", "Valid", "Empty header",
  "Issued at", "Not before", "Expires at", "Expired at", "Reference", "Deserialize", "Class", "Flow",
  "Comparison Report", "Generated Types", "All fields match", "Payload matches",
  "No structural differences", "Make sure both inputs", "Invalid JSON", "Failed to fetch",
  "Switch to dark mode", "Switch to light mode", "Initializing editor", "Expected:", "Found:",
  "(root)", "Buy me a Coffee", "differences?", "mismatch", "mismatches",
];

// Solo en texto JSX: como literales son claves de DiffType ('missing', 'extra').
const FORBIDDEN_IN_JSX_TEXT = ["missing", "extra"];

const toPattern = (phrase: string): RegExp => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, (c) => (c === "?" ? c : `\\${c}`));
  const start = /^\w/.test(phrase) ? "\\b" : "";
  const end = /\w\??$/.test(phrase) ? "\\b" : "";
  return new RegExp(`${start}${escaped}${end}`);
};

const stringLiterals = (source: string): string[] =>
  [...source.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map(
    (m) => m[1] ?? m[2] ?? (m[3] ?? "").replace(/\$\{[^}]*\}/g, " ")
  );

const jsxTexts = (source: string): string[] =>
  [...source.matchAll(/[>}]([^<>{}]+)[<{]/g)].map((m) => m[1]).filter((text) => !/[;=()]/.test(text));

const offenders = (file: string): string[] => {
  const source = readFileSync(file, "utf8");
  const literals = stringLiterals(source);
  const texts = jsxTexts(source);
  const found = FORBIDDEN.filter((phrase) =>
    [...literals, ...texts].some((text) => toPattern(phrase).test(text))
  );
  const foundInJsx = FORBIDDEN_IN_JSX_TEXT.filter((word) => texts.some((text) => toPattern(word).test(text)));
  return [...found, ...foundInJsx];
};

describe("textos visibles en español (AC-7.1, AC-7.2)", () => {
  const files = listTsx(SRC);

  test("se analizan los componentes", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  test.each(files.map((file) => [relative(SRC, file), file]))("%s no contiene textos en inglés", (_name, file) => {
    expect(offenders(file)).toEqual([]);
  });

  test("las etiquetas de diferencias del comparador están en español", () => {
    expect(DIFF_LABELS).toEqual({
      missing: "Falta",
      extra: "Sobra",
      type_mismatch: "Tipo distinto",
      null_mismatch: "Null inesperado",
    });
  });
});

describe("carcasa de la app (NFR-002)", () => {
  test("App.tsx tiene menos de 100 líneas", () => {
    const lines = readFileSync(join(SRC, "App.tsx"), "utf8").split("\n").length;
    expect(lines).toBeLessThan(100);
  });
});
