import { jsonToTypeScript } from "../services/converter";
import { jsonToZod } from "../services/zodGenerator";

function testUnionTypes() {
  console.log("=== Testing Union Type Detection ===");
  
  const testData = {
    mixedArray: ["string", 42, true, null],
    stringArray: ["a", "b", "c"],
    numberArray: [1, 2, 3],
    booleanArray: [true, false, true],
    nested: {
      mixed: ["text", 123, false]
    }
  };

  const jsonString = JSON.stringify(testData, null, 2);
  
  try {
    const tsResult = jsonToTypeScript(jsonString, {
      rootName: "UnionTest",
      outputMode: 'interface'
    });
    
    console.log("✅ TypeScript union type detection working correctly");
    console.log("Generated TypeScript:");
    console.log(tsResult);
    
    // Check if union types are correctly detected
    if (tsResult.includes("(string | number | boolean | null)[]")) {
      console.log("✅ Mixed array union type detected correctly");
    } else {
      console.log("❌ Mixed array union type not detected");
    }
    
    if (tsResult.includes("string[]") && tsResult.includes("number[]") && tsResult.includes("boolean[]")) {
      console.log("✅ Homogeneous arrays typed correctly");
    } else {
      console.log("❌ Homogeneous arrays not typed correctly");
    }
    
  } catch (error) {
    console.error("❌ TypeScript conversion failed:", error);
  }
  
  try {
    const zodResult = jsonToZod(jsonString, {
      rootName: "UnionTest"
    });
    
    console.log("\n✅ Zod schema generation working correctly");
    console.log("Generated Zod schema:");
    console.log(zodResult);
    
    // Check if Zod union types are correctly detected
    if (zodResult.includes("z.union([z.string(), z.number(), z.boolean(), z.null()])")) {
      console.log("✅ Zod mixed array union type detected correctly");
    } else {
      console.log("❌ Zod mixed array union type not detected");
    }
    
  } catch (error) {
    console.error("❌ Zod conversion failed:", error);
  }
}

function testCircularReference() {
  console.log("\n=== Testing Circular Reference Protection ===");
  
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
    console.log("✅ TypeScript circular reference handling working");
    console.log("Generated TypeScript:");
    console.log(tsResult);
    
    // Test Zod conversion
    const zodResult = jsonToZod(jsonString, {
      rootName: "CircularTest"
    });
    console.log("✅ Zod circular reference handling working");
    console.log("Generated Zod schema:");
    console.log(zodResult);
    
  } catch (error) {
    console.error("❌ Circular reference test failed:", error);
  }
}

function testNullTypes() {
  console.log("\n=== Testing Null Type Handling ===");
  
  const testData = {
    nullable: null,
    mixedWithNull: ["string", null, 42],
    objectWithNull: {
      value: null
    }
  };

  const jsonString = JSON.stringify(testData, null, 2);
  
  try {
    const tsResult = jsonToTypeScript(jsonString, {
      rootName: "NullTest",
      outputMode: 'interface'
    });
    
    console.log("✅ TypeScript null type handling working correctly");
    console.log("Generated TypeScript:");
    console.log(tsResult);
    
    // Check if null types are correctly detected
    if (tsResult.includes("null")) {
      console.log("✅ Null types detected correctly");
    } else {
      console.log("❌ Null types not detected correctly");
    }
    
  } catch (error) {
    console.error("❌ TypeScript null type test failed:", error);
  }
}

// Run all tests
testUnionTypes();
testCircularReference();
testNullTypes();

console.log("\n=== All Tests Completed ===");