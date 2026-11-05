import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    // Placeholders: the smoke tests never reach Supabase.
    env: {
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "e2e",
    },
  },
});
