import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Integration tests against the local Supabase stack. Reads the same .env.local as the app.
export default defineConfig(({ mode }) => ({
  test: {
    environment: "node",
    include: ["tests/db/**/*.test.ts"],
    env: loadEnv(mode, process.cwd(), "VITE_"),
  },
}));
