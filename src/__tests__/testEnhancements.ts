import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";

// Test data with mixed types
const testData = {
  mixedArray: ["string", 42, true, null],
  stringArray: ["a", "b", "c"],
  numberArray: [1, 2, 3],
  nested: {
    mixed: ["text", 123, false]
  }
};

const jsonString = JSON.stringify(testData, null, 2);

console.log("=== Testing TypeScript Generation ===");
try {
  const tsResult = jsonToTypeScript(jsonString, {
    rootName: "TestRoot",
    outputMode: 'interface'
  });
  console.log(tsResult);
} catch (error) {
  console.error("TypeScript conversion error:", error);
}

console.log("\n=== Testing Zod Schema Generation ===");
try {
  const zodResult = jsonToZod(jsonString, {
    rootName: "TestRoot"
  });
  console.log(zodResult);
} catch (error) {
  console.error("Zod conversion error:", error);
}