import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { z } from "zod";

// Vercel deploys every file in api/ as its own function, so the whole Hono app lives in this one file
// and vercel.json rewrites /api/* here. Split routes into modules outside api/ as it grows.

// Same public values as the browser. Server-only secrets (service-role, Stripe, Resend) go here too,
// without a VITE_ prefix.
const env = z
  .object({
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  })
  .parse(process.env);

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type Variables = { userId: string };

const app = new Hono<{ Variables: Variables }>().basePath("/api");

// Deny by default: every route needs a valid Supabase access token. Mount public routes above this.
app.use(async (c, next) => {
  const token = c.req.header("Authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  // getClaims verifies the JWT signature (locally via JWKS with asymmetric keys) and expiry.
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data) return c.json({ error: "Unauthorized" }, 401);

  c.set("userId", data.claims.sub);
  await next();
});

app.get("/me", (c) => c.json({ userId: c.get("userId") }));

export default app;
