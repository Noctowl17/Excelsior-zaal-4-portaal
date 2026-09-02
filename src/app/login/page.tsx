"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const errorTranslations: Record<string, string> = {
  "Invalid login credentials": "E-mailadres of wachtwoord klopt niet.",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(errorTranslations[error.message] ?? error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-[0_8px_30px_-12px_rgba(220,38,38,0.25)]">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
          E31
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">Staf login</h1>
        <p className="mt-2 text-sm text-muted">
          Alleen voor staf die aanwezigheid, statistieken en spelers mag
          invoeren.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="naam@voorbeeld.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:opacity-50"
          >
            {status === "sending" ? "Bezig..." : "Inloggen"}
          </button>
        </form>

        {status === "error" && (
          <p className="mt-4 text-sm text-danger">{errorMessage}</p>
        )}

        <p className="mt-4 text-xs text-muted">
          Nog geen wachtwoord, of kwijt? Vraag het aan bij een beheerder.
        </p>
      </div>
    </div>
  );
}
