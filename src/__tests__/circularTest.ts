import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";

// Test circular reference handling
console.log("=== Testing Circular Reference Handling ===");

try {
  // Create a simple circular reference
  const circular: any = { name: "test" };
  circular.self = circular;
  
  // Convert to JSON string with circular reference handling
  const jsonString = JSON.stringify(circular, (key, value) => {
    if (key === "self" && typeof value === "object" && value !== null) {
      // Break circular reference for JSON serialization
      return "[Circular]";
    }
    return value;
  }, 2);
  
  console.log("Circular reference JSON:", jsonString);
  
  // Test TypeScript conversion
  const tsResult = jsonToTypeScript(jsonString, {
    rootName: "CircularTest",
    outputMode: 'interface'
  });
  console.log("TypeScript result:", tsResult);
  
  // Test Zod conversion
  const zodResult = jsonToZod(jsonString, {
    rootName: "CircularTest"
  });
  console.log("Zod result:", zodResult);
  
} catch (error) {
  console.error("Circular reference test error:", error);
}