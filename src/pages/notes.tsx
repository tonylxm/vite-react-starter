import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface Note {
  id: number;
  body: string;
  created_at: string;
}

export function NotesPage() {
  const session = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();

  // Bumped after a change to refetch the list.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    // No user filter needed: the RLS policy only returns the signed-in user's rows.
    void supabase
      .from("notes")
      .select("id, body, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setError(error?.message);
        setNotes(data ?? []);
      });
    return () => {
      active = false;
    };
  }, [version]);

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await supabase.from("notes").insert({ body });
    if (error) {
      setError(error.message);
      return;
    }
    setBody("");
    setVersion((v) => v + 1);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-16 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {session?.user.email}
          </p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </header>

      <form onSubmit={addNote} className="flex gap-2">
        <Label className="sr-only" htmlFor="note-body">
          New note
        </Label>
        <Input
          id="note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a note"
          maxLength={1000}
          required
        />
        <Button type="submit">Add</Button>
      </form>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {notes.length === 0 ? (
        <p className="text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {notes.map((note) => (
            <li key={note.id} className="px-4 py-3 break-words">
              {note.body}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
