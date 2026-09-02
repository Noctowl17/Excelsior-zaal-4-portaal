import { createClient } from "@/lib/supabase/server";
import {
  getMatchScoreView,
  outcomeLabel,
  type MatchOutcome,
  type MatchScoreInput,
} from "@/lib/match-result";

export const metadata = {
  title: "Statistieken - Excelsior'31 4",
};

const outcomeDotStyle: Record<MatchOutcome, string> = {
  win: "bg-accent",
  draw: "bg-border",
  loss: "bg-danger",
};

type AttendanceStatus = "present" | "absent" | "excused" | "injured";

const attendanceCellLabel: Record<AttendanceStatus, string> = {
  present: "Aanwezig",
  absent: "Afwezig",
  excused: "Afgemeld",
  injured: "Geblesseerd",
};

type MatchRow = MatchScoreInput & {
  id: string;
  starts_at: string;
  opponent: string | null;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  shirt_number: number | null;
};

export default async function StatistiekenPage() {
  const supabase = await createClient();

  const [{ data: seasonTotals, error: seasonError }, { data: players, error: playersError }] =
    await Promise.all([
      supabase
        .from("player_stats_overview")
        .select("*")
        .order("goals", { ascending: false })
        .order("assists", { ascending: false })
        .order("last_name", { ascending: true }),
      supabase
        .from("players")
        .select("id, first_name, last_name, shirt_number")
        .order("last_name", { ascending: true }),
    ]);

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, home_score, away_score")
    .eq("status", "played")
    .order("starts_at", { ascending: true });

  const matchIds = (matches ?? []).map((m) => m.id);

  // Bij nul gespeelde wedstrijden geeft `.in("match_id", [])` een lege
  // resultaatset — we slaan de extra round-trips dan gewoon over.
  const [{ data: attendance }, { data: matchStats }, { data: cards }] =
    matchIds.length > 0
      ? await Promise.all([
          supabase
            .from("attendance")
            .select("player_id, match_id, status")
            .in("match_id", matchIds),
          supabase
            .from("match_stats")
            .select("player_id, match_id, goals, assists")
            .in("match_id", matchIds),
          supabase
            .from("cards")
            .select("player_id, match_id, card_type")
            .in("match_id", matchIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const attendanceByKey = new Map(
    (attendance ?? []).map((a) => [`${a.match_id}:${a.player_id}`, a.status as AttendanceStatus]),
  );
  const statsByKey = new Map(
    (matchStats ?? []).map((s) => [`${s.match_id}:${s.player_id}`, s]),
  );
  const cardsByKey = new Map<string, string[]>();
  for (const c of cards ?? []) {
    const key = `${c.match_id}:${c.player_id}`;
    cardsByKey.set(key, [...(cardsByKey.get(key) ?? []), c.card_type]);
  }

  const loadError = seasonError ?? playersError ?? matchesError;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistieken</h1>
        <p className="mt-2 text-muted">
          Alle spelersdata dit seizoen in tabelvorm — in totaal en per
          wedstrijd.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-danger">
          Kon statistieken niet laden: {loadError.message}
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Seizoentotalen per speler
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Speler</th>
                <th className="px-3 py-2 font-medium">Positie</th>
                <th className="px-3 py-2 text-center font-medium">Aanwezig</th>
                <th className="px-3 py-2 text-center font-medium">Gewonnen</th>
                <th className="px-3 py-2 text-center font-medium">Goals</th>
                <th className="px-3 py-2 text-center font-medium">Assists</th>
                <th className="px-3 py-2 text-center font-medium">Geel</th>
                <th className="px-3 py-2 text-center font-medium">Rood</th>
                <th className="px-3 py-2 text-center font-medium">Blessures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {seasonTotals?.map((p) => (
                <tr key={p.id} className="bg-background/40">
                  <td className="px-3 py-2 text-muted">{p.shirt_number ?? "–"}</td>
                  <td className="px-3 py-2 font-medium">
                    {p.first_name} {p.last_name}
                    {!p.active && (
                      <span className="ml-2 text-xs text-muted">(inactief)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted">{p.position ?? "onbekend"}</td>
                  <td className="px-3 py-2 text-center">{p.matches_present ?? 0}</td>
                  <td className="px-3 py-2 text-center text-accent">{p.matches_won ?? 0}</td>
                  <td className="px-3 py-2 text-center font-semibold text-accent">
                    {p.goals ?? 0}
                  </td>
                  <td className="px-3 py-2 text-center">{p.assists ?? 0}</td>
                  <td className="px-3 py-2 text-center">
                    {p.yellow_cards ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-3 w-2.5 rounded-sm bg-warning" />
                        {p.yellow_cards}
                      </span>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {p.red_cards ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-3 w-2.5 rounded-sm bg-danger" />
                        {p.red_cards}
                      </span>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">{p.matches_injured ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {seasonTotals && seasonTotals.length === 0 && (
          <p className="mt-3 text-muted">Nog geen spelers toegevoegd.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Per wedstrijd
        </h2>
        <p className="mt-1 text-sm text-muted">
          Scroll opzij voor alle wedstrijden. Kolomkop toont datum, tegenstander
          en de uitslag.
        </p>

        {matches && matches.length === 0 ? (
          <p className="mt-3 text-muted">
            Nog geen gespeelde wedstrijden om te tonen. Zodra een uitslag is
            ingevuld bij een wedstrijd, verschijnt hij hier.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
            <table className="text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
                  <th className="sticky left-0 z-10 whitespace-nowrap bg-surface px-3 py-2 text-left font-medium">
                    Speler
                  </th>
                  {(matches as MatchRow[]).map((m) => {
                    const date = new Date(m.starts_at);
                    const scoreView = getMatchScoreView(m);
                    return (
                      <th
                        key={m.id}
                        className="border-l border-border px-2 py-2 text-center font-medium"
                        title={`${date.toLocaleDateString("nl-NL", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })} · ${m.is_home ? "Thuis" : "Uit"} tegen ${m.opponent ?? "onbekend"}${
                          scoreView
                            ? ` · ${scoreView.ownScore}-${scoreView.opponentScore} (${outcomeLabel[scoreView.outcome]})`
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="whitespace-nowrap text-[10px] normal-case text-muted">
                            {date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                          </span>
                          <span className="max-w-[64px] truncate text-[11px] font-semibold normal-case text-foreground">
                            {m.opponent ?? "?"}
                          </span>
                          {scoreView && (
                            <span
                              className={`h-1.5 w-5 rounded-full ${outcomeDotStyle[scoreView.outcome]}`}
                            />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(players as PlayerRow[] | null)?.map((p) => (
                  <tr key={p.id}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-r border-border bg-background px-3 py-2 text-left font-medium">
                      {p.first_name} {p.last_name}
                      {p.shirt_number ? (
                        <span className="ml-1 text-xs text-muted">#{p.shirt_number}</span>
                      ) : null}
                    </td>
                    {(matches as MatchRow[]).map((m) => {
                      const key = `${m.id}:${p.id}`;
                      const status = attendanceByKey.get(key);
                      const stats = statsByKey.get(key);
                      const cardTypes = cardsByKey.get(key) ?? [];

                      return (
                        <td
                          key={m.id}
                          className="border-l border-border px-2 py-2 text-center align-middle"
                          title={status ? attendanceCellLabel[status] : "Niet geregistreerd"}
                        >
                          {!status && <span className="text-muted">·</span>}
                          {status === "absent" && <span className="text-muted">–</span>}
                          {status === "excused" && (
                            <span className="text-xs italic text-muted">vrij</span>
                          )}
                          {status === "injured" && <span>🤕</span>}
                          {status === "present" && (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center justify-center gap-1 text-xs">
                                {stats?.goals ? (
                                  <span className="font-semibold text-accent">
                                    {stats.goals}G
                                  </span>
                                ) : null}
                                {stats?.assists ? (
                                  <span className="text-foreground">{stats.assists}A</span>
                                ) : null}
                                {!stats?.goals && !stats?.assists && cardTypes.length === 0 && (
                                  <span className="text-accent">✓</span>
                                )}
                              </div>
                              {cardTypes.length > 0 && (
                                <div className="flex items-center justify-center gap-0.5">
                                  {cardTypes.map((type, i) => (
                                    <span
                                      key={i}
                                      className={`inline-block h-2.5 w-2 rounded-[1px] ${
                                        type === "red" ? "bg-danger" : "bg-warning"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>
            <span className="font-semibold text-accent">✓</span> aanwezig, gespeeld
          </span>
          <span>
            <span className="font-semibold text-accent">2G</span> goals ·{" "}
            <span className="font-semibold">1A</span> assists
          </span>
          <span>
            <span className="inline-block h-2.5 w-2 rounded-[1px] bg-warning align-middle" />{" "}
            geel ·{" "}
            <span className="inline-block h-2.5 w-2 rounded-[1px] bg-danger align-middle" />{" "}
            rood
          </span>
          <span>– afwezig · vrij afgemeld · 🤕 geblesseerd · · niet geregistreerd</span>
        </div>
      </section>
    </div>
  );
}
