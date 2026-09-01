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

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold">Welkom bij Excelsior&apos;31 4</h1>
        <p className="mt-2 text-neutral-600">
          Aanwezigheid, doelpunten, assists, kaarten en blessures van ons
          zaalvoetbalteam - allemaal op één plek.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-medium">Eerstvolgende wedstrijd</h2>
        {nextMatch ? (
          <div className="mt-2 text-neutral-700">
            <p>
              {new Date(nextMatch.starts_at).toLocaleString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="mt-1">
              {nextMatch.is_home ? "Thuis" : "Uit"} tegen{" "}
              <strong>{nextMatch.opponent ?? "onbekende tegenstander"}</strong>
              {nextMatch.location ? ` - ${nextMatch.location}` : ""}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-neutral-500">
            Nog geen wedstrijden bekend. Zodra het speelschema is
            gesynchroniseerd, verschijnt hier de eerstvolgende wedstrijd.
          </p>
        )}
        <Link
          href="/wedstrijden"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Bekijk het hele speelschema &rarr;
        </Link>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-medium">Topscorers</h2>
        {topScorers && topScorers.length > 0 ? (
          <ol className="mt-2 space-y-1 text-neutral-700">
            {topScorers.map((p) => (
              <li key={p.id}>
                {p.first_name} {p.last_name} - {p.goals} doelpunt
                {p.goals === 1 ? "" : "en"}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-neutral-500">
            Nog geen doelpunten geregistreerd dit seizoen.
          </p>
        )}
        <Link
          href="/spelers"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Bekijk alle spelers en statistieken &rarr;
        </Link>
      </section>
    </div>
  );
}
