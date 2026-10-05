import { jsonToMermaid } from "../services/mermaidGenerator";

describe("jsonToMermaid", () => {
  describe("classDiagram", () => {
    test("first line is classDiagram", () => {
      const out = jsonToMermaid('{"a":1}', { diagram: "class" });
      expect(out.split("\n")[0]).toBe("classDiagram");
    });

    test("contains class Root by default", () => {
      const out = jsonToMermaid('{"a":1}', { diagram: "class" });
      expect(out).toContain("class Root");
    });

    test("uses configurable rootName", () => {
      const out = jsonToMermaid('{"a":1}', { diagram: "class", rootName: "MyRoot" });
      expect(out).toContain("class MyRoot");
    });

    test("renders object fields as referenced class", () => {
      const json = JSON.stringify({ user: { name: "x" } });
      const out = jsonToMermaid(json, { diagram: "class" });
      expect(out).toContain("class User");
      expect(out).toContain(": User");
    });

    test("renders string fields as string type", () => {
      const out = jsonToMermaid('{"name":"x"}', { diagram: "class" });
      expect(out).toMatch(/\+name\s*:\s*string/);
    });

    test("renders number fields as int", () => {
      const out = jsonToMermaid('{"age":30}', { diagram: "class" });
      expect(out).toMatch(/\+age\s*:\s*int/);
    });

    test("renders array of objects with cardinality", () => {
      const json = JSON.stringify({ items: [{ id: 1 }] });
      const out = jsonToMermaid(json, { diagram: "class" });
      expect(out).toContain('"1" --> "0..*"');
    });

    test("renders nested object with 1:1 cardinality", () => {
      const json = JSON.stringify({ a: { b: 1 } });
      const out = jsonToMermaid(json, { diagram: "class" });
      expect(out).toContain('"1" --> "1"');
    });

    test("deduplicates colliding names", () => {
      const json = JSON.stringify({ user: { x: 1 }, user1: { x: 2 } });
      const out = jsonToMermaid(json, { diagram: "class" });
      expect(out).toContain("class User");
    });

    test("handles circular references without throwing", () => {
      const obj: Record<string, unknown> = { name: "x" };
      obj.self = obj;
      const safe = JSON.stringify(obj, (k, v) => {
        if (k === "self") return "[Circular]";
        return v;
      });
      expect(() => jsonToMermaid(safe, { diagram: "class" })).not.toThrow();
    });

    test("throws on invalid JSON", () => {
      expect(() => jsonToMermaid("not json", { diagram: "class" })).toThrow("JSON Inválido");
    });
  });

  describe("erDiagram", () => {
    test("first line is erDiagram", () => {
      const out = jsonToMermaid('{"a":1}', { diagram: "er" });
      expect(out.split("\n")[0]).toBe("erDiagram");
    });

    test("uses uppercase entity names", () => {
      const out = jsonToMermaid('{"user":{"name":"x"}}', { diagram: "er" });
      expect(out).toContain("USER");
      expect(out).toContain("ROOT");
    });

    test("maps number to int and string to string", () => {
      const out = jsonToMermaid('{"name":"x","age":30}', { diagram: "er" });
      expect(out).toContain("string name");
      expect(out).toMatch(/int\s+age/);
    });

    test("uses ||--o{ for arrays", () => {
      const json = JSON.stringify({ items: [{ id: 1 }] });
      const out = jsonToMermaid(json, { diagram: "er" });
      expect(out).toContain("||--o{");
    });

    test("uses ||--|| for nested objects", () => {
      const json = JSON.stringify({ a: { b: 1 } });
      const out = jsonToMermaid(json, { diagram: "er" });
      expect(out).toContain("||--||");
    });
  });

  describe("flowchart", () => {
    test("first line is flowchart TD", () => {
      const out = jsonToMermaid('{"a":1}', { diagram: "flow" });
      expect(out.split("\n")[0]).toBe("flowchart TD");
    });

    test("renders objects as nodes", () => {
      const out = jsonToMermaid('{"root":{"child":{"x":{"y":1}}}}', { diagram: "flow" });
      expect(out).toContain('Root["Root"]');
      expect(out).toContain('Child["Child"]');
      expect(out).toContain('X["X"]');
    });

    test("draws edges from parent to child", () => {
      const out = jsonToMermaid('{"a":{"b":{"c":{"e":1}}}}', { diagram: "flow" });
      expect(out).toMatch(/A -->\|b\| B/);
      expect(out).toMatch(/B -->\|c\| C/);
    });

    test("omits primitive leaves", () => {
      const out = jsonToMermaid('{"only_string":"x"}', { diagram: "flow" });
      expect(out).toBe('flowchart TD\n    Root["Root"]');
    });
  });
});