import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffContext } from "@/lib/staff";

export default async function BeheerLayout({ children }: LayoutProps<"/beheer">) {
  const { user, isStaff } = await getStaffContext();

  if (!user) {
    redirect("/login");
  }

  if (!isStaff) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight">Geen stafrechten</h1>
        <p className="mt-2 text-muted">
          Je bent ingelogd als {user.email}, maar dit account staat nog niet
          in de staflijst. Vraag een beheerder om je toe te voegen via
          Supabase (zie README, sectie &quot;Staf-accounts aanmaken&quot;).
        </p>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/beheer"
          className="rounded-full border border-border px-3 py-1.5 text-muted transition hover:border-accent hover:text-accent"
        >
          Overzicht
        </Link>
        <Link
          href="/beheer/wedstrijden"
          className="rounded-full border border-border px-3 py-1.5 text-muted transition hover:border-accent hover:text-accent"
        >
          Wedstrijden invoeren
        </Link>
        <Link
          href="/beheer/spelers"
          className="rounded-full border border-border px-3 py-1.5 text-muted transition hover:border-accent hover:text-accent"
        >
          Spelers beheren
        </Link>
        <Link
          href="/beheer/blessures"
          className="rounded-full border border-border px-3 py-1.5 text-muted transition hover:border-accent hover:text-accent"
        >
          Blessures
        </Link>
      </nav>
      {children}
    </div>
  );
}
