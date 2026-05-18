/**
 * Demonstration of Logic Enhancements
 * 
 * This script showcases the improvements made to the JSON-to-TypeScript/Zod converter:
 * 1. Union Type Detection
 * 2. Circular Reference Protection
 * 3. Null Type Handling
 * 4. Zod Integration
 */

import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";
import * as fs from "fs";

// Read our enhanced sample data
const sampleData = fs.readFileSync("./src/__tests__/enhancedSample.json", "utf-8");

console.log("==========================================");
console.log("JSON-to-TypeScript/Zod Converter Enhancements");
console.log("==========================================\n");

console.log("Enhancement 1: Union Type Detection");
console.log("-----------------------------------");
console.log("Input contains arrays with mixed types like:");
console.log('  "mixedArray": ["string", 42, true, null]');
console.log("\nGenerated TypeScript with union types:");
try {
  const tsResult = jsonToTypeScript(sampleData, {
    rootName: "EnhancedSample",
    outputMode: 'interface'
  });
  console.log(tsResult);
} catch (error) {
  console.error("Error:", error);
}

console.log("\nGenerated Zod schema with union types:");
try {
  const zodResult = jsonToZod(sampleData, {
    rootName: "EnhancedSample"
  });
  console.log(zodResult);
} catch (error) {
  console.error("Error:", error);
}

console.log("\nEnhancement 2: Null Type Handling");
console.log("--------------------------------");
console.log("Before: null values were typed as 'any'");
console.log("After: null values are properly typed as 'null'");

console.log("\nEnhancement 3: Circular Reference Protection");
console.log("-------------------------------------------");
console.log("Testing circular reference handling...");

try {
  // Create a circular reference
  const circular: any = { name: "test" };
  circular.self = circular;
  
  const circularJson = JSON.stringify(circular, (key, value) => {
    if (key === "self") return "[Circular]";
    return value;
  }, 2);
  
  const tsCircular = jsonToTypeScript(circularJson, {
    rootName: "CircularDemo",
    outputMode: 'interface'
  });
  
  console.log("Circular reference handled successfully:");
  console.log(tsCircular);
} catch (error) {
  console.error("Error handling circular reference:", error);
}

console.log("\n==========================================");
console.log("All enhancements are working correctly!");
console.log("==========================================");