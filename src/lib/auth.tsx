import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type ReactNode } from "react";
import { SessionContext } from "./session";
import { supabase } from "./supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>();

  useEffect(() => {
    // Fires once with the stored session (INITIAL_SESSION), then on every sign-in, sign-out and refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <SessionContext value={session}>{children}</SessionContext>;
}
