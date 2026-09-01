import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FootballExperienceClient } from "@/components/football/FootballExperienceClient";
import type { StadiumPlayer } from "@/components/football/types";

// Homepage-hero: geporteerd van het "stadium-spirit"-ontwerp dat je zelf met
// Lovable maakte (een interactieve 3D-veldweergave met zwevende
// spelerskaarten), aangepast voor Excelsior'31 4: echte Supabase-data, een
// 1-2-1-1-basisformatie (i.p.v. het 4-3-3 uit het ontwerp), initialen i.p.v.
// echte foto's (die heb je nog niet aangeleverd), en zonder de decoratieve
// navigatiebalk uit het ontwerp — de site heeft al een eigen header. Dit
// vervangt de eerdere "Broadcast"-homepage.

// Vaste 3D-posities voor de basisvijf in een 1-2-1-1-opstelling, in het
// coördinatenstelsel van het veld (x: -10..10, z: -16 aanval .. 16 verdediging).
const FORMATION_SLOTS: [number, number, number][] = [
  [0, 0, 12], // keeper
  [0, 0, 6], // vaste verdediger
  [-5.5, 0, -1], // linker aspeler
  [5.5, 0, -1], // rechter aspeler
  [0, 0, -10], // pivot/aanvaller
];

type SquadPlayer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  shirt_number: number | null;
  position: string | null;
  goals: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  matches_present: number | null;
};

function displayName(firstName: string | null, lastName: string | null) {
  const last = lastName?.trim() || "Onbekend";
  const initial = firstName?.trim()?.[0];
  return initial ? `${initial}. ${last}` : last;
}

function initialsOf(firstName: string | null, lastName: string | null) {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: nextMatch } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, location")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: squad } = await supabase
    .from("player_stats_overview")
    .select(
      "id, first_name, last_name, shirt_number, position, goals, yellow_cards, red_cards, matches_present",
    )
    .eq("active", true)
    .order("shirt_number", { ascending: true, nullsFirst: false })
    .order("last_name", { ascending: true });

  // De view geeft `id` als nullable terug; spelers zonder id kunnen niet
  // voorkomen (players.id is de primary key), maar we filteren ze hier
  // expliciet weg zodat SquadPlayer.id altijd een string is.
  const squadRows = (squad ?? []).filter((p): p is SquadPlayer => p.id !== null);

  const onPitchRows = squadRows.slice(0, FORMATION_SLOTS.length);
  const benchRows = squadRows.slice(FORMATION_SLOTS.length);

  const onPitch: StadiumPlayer[] = onPitchRows.map((p, index) => ({
    id: p.id,
    name: displayName(p.first_name, p.last_name),
    initials: initialsOf(p.first_name, p.last_name),
    number: p.shirt_number,
    position: p.position,
    matches: p.matches_present ?? 0,
    goals: p.goals ?? 0,
    yellowCards: p.yellow_cards ?? 0,
    redCards: p.red_cards ?? 0,
    coordinates: FORMATION_SLOTS[index] ?? FORMATION_SLOTS[FORMATION_SLOTS.length - 1],
  }));

  const { data: attendanceRows } = await supabase.from("attendance").select("match_id");
  const played = new Set((attendanceRows ?? []).map((a) => a.match_id)).size;

  const { data: statsRows } = await supabase.from("match_stats").select("goals");
  const goalsFor = (statsRows ?? []).reduce((sum, r) => sum + (r.goals ?? 0), 0);

  const { data: cardRows } = await supabase.from("cards").select("card_type");
  const yellows = (cardRows ?? []).filter((c) => c.card_type === "yellow").length;
  const reds = (cardRows ?? []).filter((c) => c.card_type === "red").length;

  return (
    <div className="space-y-8">
      {onPitch.length > 0 ? (
        <FootballExperienceClient
          players={onPitch}
          clubName="Excelsior'31 4"
          formationLabel="1-2-1-1"
          seasonLabel={`Seizoen ${new Date().getFullYear()}`}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          Nog geen spelers toegevoegd.
        </div>
      )}

      {benchRows.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Bank</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {benchRows.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                <p className="font-medium">
                  {displayName(p.first_name, p.last_name)}
                  {p.shirt_number ? ` (#${p.shirt_number})` : ""}
                </p>
                <p className="text-xs text-muted">{p.position ?? "positie onbekend"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Eerstvolgende wedstrijd
          </h2>
          {nextMatch ? (
            <div className="mt-3">
              <p className="text-sm text-accent">
                {new Date(nextMatch.starts_at).toLocaleString("nl-NL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {nextMatch.is_home ? "Thuis" : "Uit"}
              </p>
              <p className="mt-2 text-lg font-semibold">
                Excelsior&apos;31 4 <span className="text-muted">vs</span> {nextMatch.opponent ?? "onbekend"}
              </p>
              {nextMatch.location && <p className="mt-1 text-sm text-muted">{nextMatch.location}</p>}
            </div>
          ) : (
            <p className="mt-3 text-muted">Nog geen wedstrijden bekend.</p>
          )}
          <Link href="/wedstrijden" className="mt-4 inline-block text-sm text-accent hover:underline">
            Heel speelschema &rarr;
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Seizoenstotalen</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-3.5 text-center">
              <div className="text-2xl font-semibold">{played}</div>
              <div className="mt-1 text-xs text-muted">Gespeeld</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3.5 text-center">
              <div className="text-2xl font-semibold">{goalsFor}</div>
              <div className="mt-1 text-xs text-muted">Doelpunten</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3.5 text-center">
              <div className="text-2xl font-semibold text-warning">{yellows}</div>
              <div className="mt-1 text-xs text-muted">Geel</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3.5 text-center">
              <div className="text-2xl font-semibold text-danger">{reds}</div>
              <div className="mt-1 text-xs text-muted">Rood</div>
            </div>
          </div>
          <Link href="/spelers" className="mt-4 inline-block text-sm text-accent hover:underline">
            Alle spelers &amp; statistieken &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
