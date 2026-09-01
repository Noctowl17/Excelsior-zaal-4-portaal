"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-[0_8px_30px_-12px_rgba(74,222,128,0.25)]">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
          E31
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">Staf login</h1>
        <p className="mt-2 text-sm text-muted">
          Alleen voor staf die aanwezigheid, statistieken en spelers mag
          invoeren. Vul je e-mailadres in en je krijgt een inloglink.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
          <input
            type="email"
            required
            placeholder="naam@voorbeeld.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:opacity-50"
          >
            {status === "sending" ? "Bezig..." : "Stuur inloglink"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-4 text-sm text-accent">
            Check je mailbox - er staat een inloglink klaar.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-danger">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
