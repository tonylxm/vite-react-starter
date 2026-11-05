// @vitest-environment node
import { describe, expect, it } from "vitest";
import app from "../api/index.ts";

describe("api", () => {
  it("rejects requests without a token", async () => {
    const res = await app.request("/api/me");
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    const res = await app.request("/api/me", {
      headers: { Authorization: "Bearer not-a-jwt" },
    });
    expect(res.status).toBe(401);
  });
});
