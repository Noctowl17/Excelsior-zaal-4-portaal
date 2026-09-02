import Link from "next/link";
import { getStaffContext } from "@/lib/staff";
import { PLAYER_POSITIONS } from "@/lib/positions";
import { createPlayer, togglePlayerActive } from "./actions";

export const metadata = {
  title: "Spelers beheren - Excelsior'31 4",
};

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function BeheerSpelersPage() {
  const { supabase } = await getStaffContext();

  const { data: players, error } = await supabase
    .from("players")
    .select("id, first_name, last_name, shirt_number, position, active, photo_url, is_starter")
    .order("last_name", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Spelers beheren</h1>
        <p className="mt-2 text-muted">
          Nieuwe spelers toevoegen, of bestaande bewerken en (de)activeren.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger">Kon spelers niet laden: {error.message}</p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Nieuwe speler
        </h2>
        <form action={createPlayer} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="first_name" required placeholder="Voornaam" className={inputClass} />
          <input name="last_name" required placeholder="Achternaam" className={inputClass} />
          <input name="shirt_number" type="number" min={0} placeholder="Rugnummer" className={inputClass} />
          <select name="position" defaultValue="" className={inputClass}>
            <option value="">Positie onbekend</option>
            {PLAYER_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Geboortedatum (optioneel)
            <input name="birth_date" type="date" className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="is_starter"
              defaultChecked
              className="h-4 w-4 rounded border-border"
            />
            Basisspeler (in de opstelling op de homepage)
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong sm:col-span-2"
          >
            Speler toevoegen
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Alle spelers
        </h2>
        <div className="mt-4 divide-y divide-border">
          {players?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vast avatarformaat; next/image is hier overkill.
                  <img
                    src={p.photo_url}
                    alt=""
                    className="h-9 w-9 flex-none rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-background text-xs font-semibold text-muted">
                    {p.first_name?.[0]}
                    {p.last_name?.[0]}
                  </span>
                )}
                <div>
                  <p className="font-medium">
                    {p.first_name} {p.last_name}
                    {p.shirt_number ? ` (#${p.shirt_number})` : ""}
                    {!p.active && <span className="ml-2 text-xs text-muted">(inactief)</span>}
                    {p.active && !p.is_starter && (
                      <span className="ml-2 text-xs text-muted">(bank)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">{p.position ?? "positie onbekend"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/beheer/spelers/${p.id}`} className="text-sm text-accent hover:underline">
                  Bewerken
                </Link>
                <form action={togglePlayerActive.bind(null, p.id, !p.active)}>
                  <button
                    type="submit"
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    {p.active ? "Deactiveren" : "Activeren"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
        {players && players.length === 0 && (
          <p className="mt-2 text-muted">Nog geen spelers toegevoegd.</p>
        )}
      </section>
    </div>
  );
}
