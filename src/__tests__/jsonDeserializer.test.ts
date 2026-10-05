import { generateJsonDeserializer } from "../services/jsonDeserializer";

describe("generateJsonDeserializer", () => {
  test("contains import { z } from zod", () => {
    const out = generateJsonDeserializer('{"name":"x"}');
    expect(out).toContain('import { z } from "zod"');
  });

  test("contains parseJson function with correct return type", () => {
    const out = generateJsonDeserializer('{"name":"x"}');
    expect(out).toMatch(/export function parseJson\(input: string\): Root/);
  });

  test("contains safeParseJson function", () => {
    const out = generateJsonDeserializer('{"name":"x"}');
    expect(out).toMatch(/export function safeParseJson\(input: string\)/);
  });

  test("contains RootSchema z.object", () => {
    const out = generateJsonDeserializer('{"name":"x","age":1}');
    expect(out).toContain("RootSchema = z.object");
  });

  test("respects rootName config", () => {
    const out = generateJsonDeserializer('{"name":"x"}', { rootName: "Payload" });
    expect(out).toContain("PayloadSchema = z.object");
    expect(out).toMatch(/export function parseJson\(input: string\): Payload/);
  });

  test("parseJson uses JSON.parse and RootSchema.parse", () => {
    const out = generateJsonDeserializer('{"name":"x"}');
    expect(out).toContain("RootSchema.parse(JSON.parse(input))");
  });

  test("safeParseJson uses RootSchema.safeParse", () => {
    const out = generateJsonDeserializer('{"name":"x"}');
    expect(out).toContain("RootSchema.safeParse(JSON.parse(input))");
  });
});