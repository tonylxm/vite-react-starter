import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts a complete environment", () => {
    expect(
      parseEnv({ VITE_API_URL: "http://localhost:5000" }).VITE_API_URL,
    ).toBe("http://localhost:5000");
  });

  it("names the missing variables", () => {
    expect(() => parseEnv({})).toThrow(/VITE_API_URL/);
  });
});
