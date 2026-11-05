import { z } from "zod";

// Public values only: VITE_ vars are baked into the browser bundle.
const schema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, unknown>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Invalid or missing environment variables: ${missing}. See .env.example.`,
    );
  }
  return result.data;
}
