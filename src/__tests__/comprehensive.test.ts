import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";

describe("Comprehensive Converter Tests", () => {
  describe("Union Type Detection", () => {
    test("should detect mixed primitive types in arrays", () => {
      const testData = {
        mixed: ["string", 42, true, null]
      };
      
      const jsonString = JSON.stringify(testData);
      const tsResult = jsonToTypeScript(jsonString, {
        rootName: "TestRoot",
        outputMode: 'interface'
      });
      
      expect(tsResult).toContain("(string | number | boolean | null)[]");
    });

    test("should handle homogeneous arrays correctly", () => {
      const testData = {
        strings: ["a", "b", "c"],
        numbers: [1, 2, 3],
        booleans: [true, false, true]
      };
      
      const jsonString = JSON.stringify(testData);
      const tsResult = jsonToTypeScript(jsonString, {
        rootName: "TestRoot",
        outputMode: 'interface'
      });
      
      expect(tsResult).toContain("strings: string[]");
      expect(tsResult).toContain("numbers: number[]");
      expect(tsResult).toContain("booleans: boolean[]");
    });
  });

  describe("Circular Reference Protection", () => {
    test("should handle circular references without infinite loops", () => {
      const circular: any = { name: "test" };
      circular.self = circular;
      
      const jsonString = JSON.stringify(circular, (key, value) => {
        if (key === "self") return "[Circular]";
        return value;
      });
      
      expect(() => {
        jsonToTypeScript(jsonString, {
          rootName: "CircularTest",
          outputMode: 'interface'
        });
      }).not.toThrow();
    });
  });

  describe("Null Type Handling", () => {
    test("should correctly type null values", () => {
      const testData = {
        nullable: null,
        mixedWithNull: ["string", null, 42]
      };
      
      const jsonString = JSON.stringify(testData);
      const tsResult = jsonToTypeScript(jsonString, {
        rootName: "TestRoot",
        outputMode: 'interface'
      });
      
      expect(tsResult).toContain("null");
      expect(tsResult).not.toContain("any");
    });
  });

  describe("Zod Generator Enhancements", () => {
    test("should generate proper union types for Zod schemas", () => {
      const testData = {
        mixed: ["string", 42, true]
      };
      
      const jsonString = JSON.stringify(testData);
      const zodResult = jsonToZod(jsonString, {
        rootName: "TestRoot"
      });
      
      expect(zodResult).toContain("z.union([z.string(), z.number(), z.boolean()])");
    });
  });
});