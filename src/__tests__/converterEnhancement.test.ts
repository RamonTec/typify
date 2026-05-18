import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";
import testData from "./testData.json";

describe("Enhanced Converter Functions", () => {
  test("should detect union types in mixed arrays", () => {
    const jsonString = JSON.stringify(testData);
    
    // Test TypeScript conversion with union types
    const tsResult = jsonToTypeScript(jsonString, {
      rootName: "TestRoot",
      outputMode: 'interface'
    });
    
    // Should contain union type for mixedArray: (string | number | boolean | null)[]
    expect(tsResult).toContain("string | number | boolean | null");
    
    // Test Zod conversion with union types
    const zodResult = jsonToZod(jsonString, {
      rootName: "TestRoot"
    });
    
    // Should contain union type for mixedArray
    expect(zodResult).toContain("z.union([");
  });

  test("should handle circular references gracefully", () => {
    // Create circular reference object
    const circular: any = { name: "circular" };
    circular.self = circular;
    
    const jsonString = JSON.stringify(circular, (key, value) => {
      // Handle circular references in JSON.stringify
      if (key === "self" && typeof value === "object") return "[Circular]";
      return value;
    });
    
    // Test that circular references are handled without infinite loops
    expect(() => {
      jsonToTypeScript(jsonString, {
        rootName: "CircularTest",
        outputMode: 'interface'
      });
    }).not.toThrow();
  });
});