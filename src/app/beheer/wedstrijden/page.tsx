import Link from "next/link";
import { getStaffContext } from "@/lib/staff";
import { getMatchScoreView, outcomeLabel, outcomeBadgeStyle } from "@/lib/match-result";

const statusLabel: Record<string, string> = {
  scheduled: "Gepland",
  played: "Gespeeld",
  cancelled: "Afgelast",
};

export const metadata = {
  title: "Wedstrijden invoeren - Excelsior'31 4",
};

export default async function BeheerWedstrijdenPage() {
  const { supabase } = await getStaffContext();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, status, home_score, away_score")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Wedstrijden invoeren</h1>
      <p className="mt-2 text-muted">
        Kies een wedstrijd om aanwezigheid, goals, assists en kaarten in te
        voeren.
      </p>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Kon wedstrijden niet laden: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {matches?.map((m) => {
          const scoreView = getMatchScoreView(m);
          return (
            <Link
              key={m.id}
              href={`/beheer/wedstrijden/${m.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/50"
            >
              <div>
                <p className="font-medium">
                  {m.is_home ? "Thuis" : "Uit"} tegen{" "}
                  {m.opponent ?? "onbekende tegenstander"}
                </p>
                <p className="text-sm text-muted">
                  {new Date(m.starts_at).toLocaleDateString("nl-NL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {scoreView && (
                  <span className="text-base font-bold tabular-nums">
                    {scoreView.ownScore}-{scoreView.opponentScore}
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    scoreView
                      ? outcomeBadgeStyle[scoreView.outcome]
                      : "border border-border text-muted"
                  }`}
                >
                  {scoreView
                    ? outcomeLabel[scoreView.outcome]
                    : (statusLabel[m.status] ?? m.status)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {matches && matches.length === 0 && (
        <p className="mt-6 text-muted">Nog geen wedstrijden gesynchroniseerd.</p>
      )}
    </div>
  );
}
