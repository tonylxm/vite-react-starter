import type { Session } from "@supabase/supabase-js";
import { createContext, use } from "react";

// undefined while the stored session is still loading, null when signed out.
export const SessionContext = createContext<Session | null | undefined>(
  undefined,
);

export function useSession(): Session | null | undefined {
  return use(SessionContext);
}
