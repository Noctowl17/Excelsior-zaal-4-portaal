import Link from "next/link";
import { Bandage } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FootballExperienceClient } from "@/components/football/FootballExperienceClient";
import type { StadiumPlayer } from "@/components/football/types";

// Homepage-hero: geporteerd van het "stadium-spirit"-ontwerp dat je zelf met
// Lovable maakte (een interactieve 3D-veldweergave met zwevende
// spelerskaarten), aangepast voor Excelsior'31 4: echte Supabase-data, een
// vaste 1-4-3-2-opstelling met de hele actieve selectie (i.p.v. het 4-3-3 uit
// het ontwerp), initialen i.p.v. echte foto's (die heb je nog niet
// aangeleverd), en zonder de decoratieve navigatiebalk uit het ontwerp — de
// site heeft al een eigen header. Dit vervangt de eerdere
// "Broadcast"-homepage. De hero is edge-to-edge (volle breedte) en groot
// weergegeven; de site-header blijft (sticky) zichtbaar erboven.

type FormationLine = "keeper" | "verdediging" | "middenveld" | "aanval";

const POSITION_LABELS: Record<FormationLine, string> = {
  keeper: "Keeper",
  verdediging: "Verdediger",
  middenveld: "Middenvelder",
  aanval: "Aanvaller",
};

// Vaste indeling die je zelf hebt doorgegeven: Frank Nijkamp staat altijd op
// doel, de rest in een 1-4-3-2-opstelling. Spelers worden herkend op voor- en
// achternaam (zoals ze in Supabase staan). Een speler die niet (meer) in dit
// lijstje voorkomt — nieuwe aanwinst, naam gewijzigd, iemand inactief — komt
// gewoon op de bank te staan in plaats van dat de pagina crasht; en een naam
// hieronder die niet (meer) actief is, wordt gewoon overgeslagen.
const FORMATION_LINEUP: {
  firstName: string;
  lastName: string;
  line: FormationLine;
  coordinates: [number, number, number];
}[] = [
  { firstName: "Frank", lastName: "Nijkamp", line: "keeper", coordinates: [0, 0, -13.5] },
  { firstName: "Stijn", lastName: "Beverdam", line: "verdediging", coordinates: [-7.5, 0, -6.5] },
  { firstName: "Jarnick", lastName: "ter Stal", line: "verdediging", coordinates: [-2.6, 0, -7.5] },
  { firstName: "Gerald", lastName: "Pas", line: "verdediging", coordinates: [2.6, 0, -7.5] },
  { firstName: "Ruben", lastName: "Smelt", line: "verdediging", coordinates: [7.5, 0, -6.5] },
  { firstName: "Sander", lastName: "Gerritsen", line: "middenveld", coordinates: [-6, 0, 0.5] },
  { firstName: "Sven", lastName: "Koedijk", line: "middenveld", coordinates: [0, 0, -0.5] },
  { firstName: "Mike", lastName: "Janssen", line: "middenveld", coordinates: [6, 0, 0.5] },
  { firstName: "Maarten", lastName: "Baan", line: "aanval", coordinates: [-3.5, 0, 8] },
  { firstName: "Frank", lastName: "Gerritsen Mulkes", line: "aanval", coordinates: [3.5, 0, 8] },
];

function nameKey(firstName: string | null, lastName: string | null) {
  return `${firstName?.trim().toLowerCase() ?? ""}|${lastName?.trim().toLowerCase() ?? ""}`;
}

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
  is_injured: boolean | null;
  photo_url: string | null;
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
      "id, first_name, last_name, shirt_number, position, goals, yellow_cards, red_cards, matches_present, is_injured, photo_url",
    )
    .eq("active", true)
    .order("shirt_number", { ascending: true, nullsFirst: false })
    .order("last_name", { ascending: true });

  // De view geeft `id` als nullable terug; spelers zonder id kunnen niet
  // voorkomen (players.id is de primary key), maar we filteren ze hier
  // expliciet weg zodat SquadPlayer.id altijd een string is.
  const squadRows = (squad ?? []).filter((p): p is SquadPlayer => p.id !== null);

  const squadByName = new Map(squadRows.map((p) => [nameKey(p.first_name, p.last_name), p]));
  const matchedIds = new Set<string>();

  const onPitch: StadiumPlayer[] = [];
  for (const slot of FORMATION_LINEUP) {
    const row = squadByName.get(nameKey(slot.firstName, slot.lastName));
    if (!row) continue;
    matchedIds.add(row.id);
    onPitch.push({
      id: row.id,
      name: displayName(row.first_name, row.last_name),
      initials: initialsOf(row.first_name, row.last_name),
      number: row.shirt_number,
      position: POSITION_LABELS[slot.line],
      matches: row.matches_present ?? 0,
      goals: row.goals ?? 0,
      yellowCards: row.yellow_cards ?? 0,
      redCards: row.red_cards ?? 0,
      injured: row.is_injured ?? false,
      photoUrl: row.photo_url,
      coordinates: slot.coordinates,
    });
  }

  const benchRows = squadRows.filter((p) => !matchedIds.has(p.id));

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
        // Full-bleed: breekt bewust uit de smalle `max-w-4xl` paginacontainer
        // (zie layout.tsx) zodat de hero de volle breedte van het scherm
        // gebruikt. De sticky header van de site blijft daar gewoon boven
        // zichtbaar en werkt normaal. Bewust GEEN `transform` (zoals de
        // gangbare `left-1/2 -translate-x-1/2`-truc) om dit te bereiken: een
        // `transform` op een voorouder maakt 'm de containing block voor
        // `position: fixed`-kinderen, wat de gecentreerde mobiele
        // spelersoverlay (MobilePlayerOverlay) zou breken — die verschijnt
        // dan immers niet meer relatief aan de echte viewport. Marge-gebaseerd
        // full-bleed geeft hetzelfde resultaat zonder dat probleem.
        <div className="overflow-x-hidden">
          <div className="w-screen" style={{ marginLeft: "calc(50% - 50vw)" }}>
            <FootballExperienceClient
              players={onPitch}
              clubName="Excelsior'31 4"
              formationLabel="1-4-3-2"
              seasonLabel={`Seizoen ${new Date().getFullYear()}`}
            />
          </div>
        </div>
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
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- klein vast avatarformaat; next/image is hier overkill.
                  <img
                    src={p.photo_url}
                    alt=""
                    className="h-9 w-9 flex-none rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-surface text-xs font-semibold text-muted">
                    {initialsOf(p.first_name, p.last_name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 font-medium">
                    {displayName(p.first_name, p.last_name)}
                    {p.shirt_number ? ` (#${p.shirt_number})` : ""}
                    {p.is_injured && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-danger"
                        title="Geblesseerd"
                      >
                        <Bandage className="h-3 w-3" aria-hidden="true" />
                        Geblesseerd
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">{p.position ?? "positie onbekend"}</p>
                </div>
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
