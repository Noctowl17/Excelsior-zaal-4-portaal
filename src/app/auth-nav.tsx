"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthNav({
  email,
  isStaff,
}: {
  email: string | null;
  isStaff: boolean;
}) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-border px-3 py-1.5 text-foreground transition hover:border-accent hover:text-accent"
      >
        Staf login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isStaff && (
        <Link href="/beheer" className="transition hover:text-foreground">
          Beheer
        </Link>
      )}
      <span className="hidden text-xs text-muted sm:inline">
        Ingelogd als <span className="text-foreground">{email}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-border px-3 py-1.5 text-foreground transition hover:border-accent hover:text-accent"
      >
        Uitloggen
      </button>
    </div>
  );
}
