import Link from "next/link";
import { getStaffContext } from "@/lib/staff";

export const metadata = {
  title: "Beheer - Excelsior'31 4",
};

export default async function BeheerHomePage() {
  const { user, role } = await getStaffContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staf-overzicht</h1>
        <p className="mt-2 text-muted">
          Welkom, {user?.email}
          {role ? ` (${role})` : ""}. Kies hieronder wat je wilt bijwerken.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/beheer/wedstrijden"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/60"
        >
          <h2 className="font-semibold">Wedstrijden invoeren</h2>
          <p className="mt-1 text-sm text-muted">
            Aanwezigheid, goals, assists en kaarten per wedstrijd.
          </p>
        </Link>
        <Link
          href="/beheer/spelers"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/60"
        >
          <h2 className="font-semibold">Spelers beheren</h2>
          <p className="mt-1 text-sm text-muted">
            Spelers toevoegen, bewerken of (de)activeren.
          </p>
        </Link>
        <Link
          href="/beheer/blessures"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/60"
        >
          <h2 className="font-semibold">Blessures</h2>
          <p className="mt-1 text-sm text-muted">
            Blessures registreren en als hersteld markeren.
          </p>
        </Link>
      </div>
    </div>
  );
}
