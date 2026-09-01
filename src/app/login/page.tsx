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
      <h1 className="text-2xl font-semibold">Staf login</h1>
      <p className="mt-2 text-neutral-600">
        Alleen voor staf die aanwezigheid, statistieken en spelers mag
        invoeren. Vul je e-mailadres in en je krijgt een inloglink.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="naam@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {status === "sending" ? "Bezig..." : "Stuur inloglink"}
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-4 text-sm text-green-700">
          Check je mailbox - er staat een inloglink klaar.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
