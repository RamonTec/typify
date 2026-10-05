import { generateJwtDeserializer, deserializeJwt } from "../services/jwtDeserializer";

const base64Url = (obj: unknown): string => {
  const b64 = btoa(JSON.stringify(obj))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return b64;
};

const makeJwt = (payload: unknown, signature = "sig"): string => {
  const header = base64Url({ alg: "HS256", typ: "JWT" });
  const body = base64Url(payload);
  return `${header}.${body}.${signature}`;
};

describe("generateJwtDeserializer", () => {
  test("contains import { z } from zod", () => {
    const out = generateJwtDeserializer('{"sub":"1"}');
    expect(out).toContain('import { z } from "zod"');
  });

  test("contains JwtPayloadSchema z.object", () => {
    const out = generateJwtDeserializer('{"sub":"1","name":"a"}');
    expect(out).toContain("JwtPayloadSchema = z.object");
  });

  test("contains export type JwtPayload", () => {
    const out = generateJwtDeserializer('{"sub":"1"}');
    expect(out).toContain("export type JwtPayload");
  });

  test("contains deserializeJwt function with correct return type", () => {
    const out = generateJwtDeserializer('{"sub":"1"}');
    expect(out).toMatch(/export function deserializeJwt\(token: string\): JwtPayload/);
  });

  test("contains local base64UrlDecode helper", () => {
    const out = generateJwtDeserializer('{"sub":"1"}');
    expect(out).toContain("base64UrlDecode");
    expect(out).toContain("atob");
  });

  test("validates parts.length === 3", () => {
    const out = generateJwtDeserializer('{"sub":"1"}');
    expect(out).toContain("parts.length !== 3");
  });

  test("respects custom rootName", () => {
    const out = generateJwtDeserializer('{"sub":"1"}', { rootName: "Token" });
    expect(out).toContain("TokenSchema = z.object");
    expect(out).toMatch(/export function deserializeJwt\(token: string\): Token/);
  });
});

describe("deserializeJwt (runtime helper)", () => {
  test("decodes JWT payload successfully", () => {
    const payload = { sub: "123", name: "Ada" };
    const token = makeJwt(payload);
    const result = deserializeJwt(token);
    expect(result).toEqual(payload);
  });

  test("throws on invalid JWT (not 3 parts)", () => {
    expect(() => deserializeJwt("a.b")).toThrow("Invalid JWT");
    expect(() => deserializeJwt("a.b.c.d")).toThrow("Invalid JWT");
  });
});