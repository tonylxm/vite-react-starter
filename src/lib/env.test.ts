import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts a complete environment", () => {
    const env = parseEnv({
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
    expect(env.VITE_SUPABASE_URL).toBe("http://127.0.0.1:54321");
  });

  it("names the missing variables", () => {
    expect(() => parseEnv({})).toThrow(
      /VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});
