import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.url(),
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
