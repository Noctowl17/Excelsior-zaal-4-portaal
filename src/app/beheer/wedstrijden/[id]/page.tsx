import { notFound } from "next/navigation";
import { getStaffContext } from "@/lib/staff";
import { saveMatchEntry, addCard, deleteCard } from "./actions";

const attendanceLabel: Record<string, string> = {
  present: "Aanwezig",
  absent: "Afwezig",
  excused: "Afgemeld",
  injured: "Geblesseerd",
};

const cardLabel: Record<string, string> = {
  yellow: "Geel",
  red: "Rood",
};

const selectClass =
  "rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const numberClass =
  "w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function MatchEntryPage({
  params,
}: PageProps<"/beheer/wedstrijden/[id]">) {
  const { id } = await params;
  const { supabase } = await getStaffContext();

  const { data: match } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, status")
    .eq("id", id)
    .maybeSingle();

  if (!match) {
    notFound();
  }

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, shirt_number")
    .eq("active", true)
    .order("last_name", { ascending: true });

  const { data: attendance } = await supabase
    .from("attendance")
    .select("player_id, status")
    .eq("match_id", id);

  const { data: stats } = await supabase
    .from("match_stats")
    .select("player_id, goals, assists")
    .eq("match_id", id);

  const { data: cards } = await supabase
    .from("cards")
    .select("id, player_id, card_type, minute")
    .eq("match_id", id);

  const attendanceMap = new Map(
    (attendance ?? []).map((a) => [a.player_id, a.status]),
  );
  const statsMap = new Map((stats ?? []).map((s) => [s.player_id, s]));
  const playerNameById = new Map(
    (players ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]),
  );

  const saveMatchEntryWithId = saveMatchEntry.bind(null, id);
  const addCardWithId = addCard.bind(null, id);
  const deleteCardWithId = deleteCard.bind(null, id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          {new Date(match.starts_at).toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {match.is_home ? "Thuis" : "Uit"} tegen{" "}
          {match.opponent ?? "onbekende tegenstander"}
        </h1>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Aanwezigheid &amp; statistieken
        </h2>
        <form action={saveMatchEntryWithId} className="mt-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-3 font-medium">Speler</th>
                  <th className="pb-2 pr-3 font-medium">Aanwezigheid</th>
                  <th className="pb-2 pr-3 font-medium">Goals</th>
                  <th className="pb-2 font-medium">Assists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players?.map((p) => {
                  const currentStatus = attendanceMap.get(p.id) ?? "present";
                  const currentStats = statsMap.get(p.id);
                  return (
                    <tr key={p.id}>
                      <td className="py-2 pr-3 font-medium">
                        {p.first_name} {p.last_name}
                        {p.shirt_number ? ` (#${p.shirt_number})` : ""}
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          name={`attendance_${p.id}`}
                          defaultValue={currentStatus}
                          className={selectClass}
                        >
                          {Object.entries(attendanceLabel).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={0}
                          name={`goals_${p.id}`}
                          defaultValue={currentStats?.goals ?? 0}
                          className={numberClass}
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          name={`assists_${p.id}`}
                          defaultValue={currentStats?.assists ?? 0}
                          className={numberClass}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            Opslaan
          </button>
        </form>
        {players && players.length === 0 && (
          <p className="mt-3 text-muted">
            Nog geen actieve spelers. Voeg eerst spelers toe onder &quot;Spelers
            beheren&quot;.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Kaarten
        </h2>
        <div className="mt-4 space-y-2">
          {cards?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-background/60 px-3 py-2 text-sm"
            >
              <span>
                <span className={c.card_type === "red" ? "text-danger" : "text-warning"}>
                  {cardLabel[c.card_type] ?? c.card_type}
                </span>{" "}
                - {playerNameById.get(c.player_id) ?? "onbekende speler"}
                {c.minute ? ` (${c.minute}')` : ""}
              </span>
              <form action={deleteCardWithId.bind(null, c.id)}>
                <button type="submit" className="text-xs text-muted hover:text-danger">
                  Verwijderen
                </button>
              </form>
            </div>
          ))}
          {cards && cards.length === 0 && (
            <p className="text-muted">Nog geen kaarten voor deze wedstrijd.</p>
          )}
        </div>

        <form action={addCardWithId} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Speler</label>
            <select name="player_id" required defaultValue="" className={selectClass}>
              <option value="" disabled>
                Kies speler...
              </option>
              {players?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Type</label>
            <select name="card_type" required defaultValue="" className={selectClass}>
              <option value="" disabled>
                Kies type...
              </option>
              <option value="yellow">Geel</option>
              <option value="red">Rood</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Minuut (optioneel)</label>
            <input type="number" min={0} name="minute" className={numberClass} />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            Kaart toevoegen
          </button>
        </form>
      </section>
    </div>
  );
}
