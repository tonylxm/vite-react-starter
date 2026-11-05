import { useActionState } from "react";
import { Navigate, useLocation } from "react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
  intent: z.enum(["sign-in", "sign-up"]),
});

interface FormState {
  error?: string;
  message?: string;
  // React resets the form after each action, so the typed email comes back to refill the field.
  email?: string;
}

async function authenticate(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawEmail = formData.get("email");
  const typedEmail = typeof rawEmail === "string" ? rawEmail : "";
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: `Enter a valid email and a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
      email: typedEmail,
    };
  }

  const { email, password, intent } = parsed.data;
  if (intent === "sign-in") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? { error: error.message, email } : {};
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { error: error.message, email };
  if (!data.session) {
    return {
      message: "Check your email for a link to confirm your account.",
      email,
    };
  }
  return {};
}

export function LoginPage() {
  const session = useSession();
  const location = useLocation();
  const [state, formAction, isPending] = useActionState(authenticate, {});

  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </div>
        {state.error && (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-muted-foreground text-sm">
            {state.message}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="intent"
            value="sign-in"
            disabled={isPending}
          >
            Sign in
          </Button>
          <Button
            type="submit"
            name="intent"
            value="sign-up"
            variant="outline"
            disabled={isPending}
          >
            Create account
          </Button>
        </div>
      </form>
    </main>
  );
}
