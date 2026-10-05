import { javaToMermaid } from "../services/javaToMermaid";

describe("javaToMermaid", () => {
  describe("classDiagram", () => {
    test("renders inheritance with <|--", () => {
      const java = `
public class User extends Person {
  private String name;
}
public class Person {
  private int age;
}
`;
      const out = javaToMermaid(java, { diagram: "class" });
      expect(out).toContain("classDiagram");
      expect(out).toContain("Person <|-- User");
    });

    test("renders nested classes", () => {
      const java = `
public class Outer {
  private String label;
  public static class Inner {
    private int value;
  }
}
`;
      const out = javaToMermaid(java, { diagram: "class" });
      expect(out).toContain("class Outer");
      expect(out).toContain("class Inner");
    });

    test("maps List<Foo> to Foo[]", () => {
      const java = `
public class Box {
  private java.util.List<Foo> items;
}
public class Foo {
  private String name;
}
`;
      const out = javaToMermaid(java, { diagram: "class" });
      expect(out).toMatch(/\+items\s*:\s*Foo\[\]/);
    });

    test("throws when no class found", () => {
      expect(() => javaToMermaid("", { diagram: "class" })).toThrow();
    });
  });

  describe("erDiagram", () => {
    test("renders erDiagram", () => {
      const java = `
public class User {
  private String name;
  private int age;
}
`;
      const out = javaToMermaid(java, { diagram: "er" });
      expect(out.split("\n")[0]).toBe("erDiagram");
      expect(out).toContain("USER");
      expect(out).toContain("string name");
    });
  });

  describe("flowchart", () => {
    test("renders flowchart TD", () => {
      const java = `
public class A {
  private B b;
}
public class B {
  private String x;
}
`;
      const out = javaToMermaid(java, { diagram: "flow" });
      expect(out.split("\n")[0]).toBe("flowchart TD");
      expect(out).toMatch(/A -->\|b\| B/);
    });
  });
});