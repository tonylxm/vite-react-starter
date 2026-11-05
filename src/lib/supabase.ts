import { createClient } from "@supabase/supabase-js";
import { parseEnv } from "./env";

const env = parseEnv(import.meta.env);

// Browser client: publishable key only. Row Level Security decides what each user can read.
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
