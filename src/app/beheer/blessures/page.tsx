import { getStaffContext } from "@/lib/staff";
import { addInjury, markInjuryRecovered } from "./actions";

export const metadata = {
  title: "Blessures - Excelsior'31 4",
};

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function BeheerBlessuresPage() {
  const { supabase } = await getStaffContext();

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name")
    .eq("active", true)
    .order("last_name", { ascending: true });

  const { data: injuries, error } = await supabase
    .from("injuries")
    .select("id, player_id, start_date, expected_return_date, description, status")
    .order("start_date", { ascending: false });

  const playerNameById = new Map(
    (players ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blessures</h1>
        <p className="mt-2 text-muted">Registreer en volg blessures per speler.</p>
      </div>

      {error && (
        <p className="text-sm text-danger">Kon blessures niet laden: {error.message}</p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Nieuwe blessure
        </h2>
        <form action={addInjury} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="player_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Kies speler...
            </option>
            {players?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Startdatum
            <input type="date" name="start_date" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Verwachte terugkeer (optioneel)
            <input type="date" name="expected_return_date" className={inputClass} />
          </label>
          <input
            name="description"
            placeholder="Omschrijving (optioneel)"
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong sm:col-span-2"
          >
            Blessure registreren
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Overzicht
        </h2>
        <div className="mt-4 space-y-2">
          {injuries?.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-background/60 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {playerNameById.get(i.player_id) ?? "onbekende speler"}
                  {i.status === "recovered" && (
                    <span className="ml-2 text-xs text-accent">Hersteld</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  Sinds {new Date(i.start_date).toLocaleDateString("nl-NL")}
                  {i.expected_return_date
                    ? ` · verwacht terug ${new Date(i.expected_return_date).toLocaleDateString("nl-NL")}`
                    : ""}
                  {i.description ? ` · ${i.description}` : ""}
                </p>
              </div>
              {i.status !== "recovered" && (
                <form action={markInjuryRecovered.bind(null, i.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    Hersteld melden
                  </button>
                </form>
              )}
            </div>
          ))}
          {injuries && injuries.length === 0 && (
            <p className="text-muted">Nog geen blessures geregistreerd.</p>
          )}
        </div>
      </section>
    </div>
  );
}
