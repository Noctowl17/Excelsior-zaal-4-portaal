import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: nextMatch } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, location, status")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: topScorers } = await supabase
    .from("player_stats_overview")
    .select("id, first_name, last_name, goals")
    .order("goals", { ascending: false })
    .limit(3);

  const rankStyles = [
    "bg-gold text-accent-foreground",
    "bg-border text-foreground",
    "bg-[#8a5a2b] text-foreground",
  ];

  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Seizoen {new Date().getFullYear()}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Welkom bij <span className="text-accent">Excelsior&apos;31 4</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Aanwezigheid, doelpunten, assists, kaarten en blessures van ons
          zaalvoetbalteam - allemaal op één plek.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0_8px_30px_-12px_rgba(74,222,128,0.25)]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Eerstvolgende wedstrijd
        </h2>
        {nextMatch ? (
          <div className="mt-3">
            <p className="text-lg font-semibold">
              {nextMatch.is_home ? "Thuis" : "Uit"} tegen{" "}
              <span className="text-accent">
                {nextMatch.opponent ?? "onbekende tegenstander"}
              </span>
            </p>
            <p className="mt-1 text-muted">
              {new Date(nextMatch.starts_at).toLocaleString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {nextMatch.location ? ` · ${nextMatch.location}` : ""}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-muted">
            Nog geen wedstrijden bekend. Zodra het speelschema is
            gesynchroniseerd, verschijnt hier de eerstvolgende wedstrijd.
          </p>
        )}
        <Link
          href="/wedstrijden"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Bekijk het hele speelschema &rarr;
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Topscorers
        </h2>
        {topScorers && topScorers.length > 0 ? (
          <ol className="mt-4 space-y-2">
            {topScorers.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-background/60 px-3 py-2"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    rankStyles[i] ?? "bg-border text-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-medium">
                  {p.first_name} {p.last_name}
                </span>
                <span className="text-sm font-semibold text-accent">
                  {p.goals} {p.goals === 1 ? "goal" : "goals"}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-muted">
            Nog geen doelpunten geregistreerd dit seizoen.
          </p>
        )}
        <Link
          href="/spelers"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Bekijk alle spelers en statistieken &rarr;
        </Link>
      </section>
    </div>
  );
}
