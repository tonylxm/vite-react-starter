import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../../api/index.ts";

// Runs against `pnpm supabase start` (see vitest.db.config.ts). Each run signs up fresh users.
const url = process.env.VITE_SUPABASE_URL!;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

function newClient(): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signUp(): Promise<{ client: SupabaseClient; token: string }> {
  const client = newClient();
  const { data, error } = await client.auth.signUp({
    email: `rls-${crypto.randomUUID()}@example.test`,
    password: "correct-horse-battery",
  });
  if (error || !data.session) throw error ?? new Error("No session");
  return { client, token: data.session.access_token };
}

describe("notes RLS", () => {
  let alice: SupabaseClient;
  let bob: SupabaseClient;
  let aliceToken: string;
  let noteId: number;

  beforeAll(async () => {
    ({ client: alice, token: aliceToken } = await signUp());
    ({ client: bob } = await signUp());
    const { data, error } = await alice
      .from("notes")
      .insert({ body: "Alice's secret" })
      .select("id")
      .single();
    if (error) throw error;
    noteId = data.id;
  });

  it("lets the owner read their note", async () => {
    const { data } = await alice.from("notes").select("id").eq("id", noteId);
    expect(data).toEqual([{ id: noteId }]);
  });

  it("hides the note from another user", async () => {
    const { data, error } = await bob.from("notes").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("stops another user changing or deleting the note", async () => {
    const updated = await bob
      .from("notes")
      .update({ body: "hacked" })
      .eq("id", noteId)
      .select("id");
    expect(updated.data).toEqual([]);

    const deleted = await bob
      .from("notes")
      .delete()
      .eq("id", noteId)
      .select("id");
    expect(deleted.data).toEqual([]);

    const { data } = await alice.from("notes").select("body").eq("id", noteId);
    expect(data).toEqual([{ body: "Alice's secret" }]);
  });

  it("stops a user adding a note as someone else", async () => {
    const { data: alicesUser } = await alice.auth.getUser();
    const { error } = await bob
      .from("notes")
      .insert({ body: "forged", user_id: alicesUser.user!.id });
    expect(error?.code).toBe("42501");
  });

  it("gives signed-out visitors nothing", async () => {
    const { data, error } = await newClient().from("notes").select("id");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("accepts the user's token in the API", async () => {
    const { data: alicesUser } = await alice.auth.getUser();
    const res = await app.request("/api/me", {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: alicesUser.user!.id });
  });
});
