import Link from "next/link";
import { Bandage } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FootballExperienceClient } from "@/components/football/FootballExperienceClient";
import type { StadiumPlayer } from "@/components/football/types";
import { type FormationLine, lineForPosition } from "@/lib/positions";

// Homepage-hero: geporteerd van het "stadium-spirit"-ontwerp dat je zelf met
// Lovable maakte (een interactieve 3D-veldweergave met zwevende
// spelerskaarten), aangepast voor Excelsior'31 4: echte Supabase-data en
// initialen i.p.v. echte foto's uit het ontwerp (spelersfoto's kun je nu
// zelf uploaden via het beheerscherm), en zonder de decoratieve
// navigatiebalk uit het ontwerp — de site heeft al een eigen header. Dit
// vervangt de eerdere "Broadcast"-homepage. De hero is edge-to-edge (volle
// breedte) en groot weergegeven; de site-header blijft (sticky) zichtbaar
// erboven.
//
// Wie er op het veld staat (i.p.v. op de bank) en op welke linie, bepaal je
// zelf via het beheerscherm: het vinkje "Basisspeler" plus de gekozen
// positie (Keeper/Verdediger/Middenvelder/Aanvaller). Dit was voorheen een
// hardcoded lijstje met voor-/achternamen in deze pagina — foutgevoelig (een
// tikfout zette iemand onbedoeld op de bank) en alleen door een developer
// aan te passen.

// Vaste "diepte" (z) per linie, met een lichte boogvorm voor linies met
// meerdere spelers (de buitenste spelers staan iets minder diep dan het
// midden van de linie) — zelfde uitstraling als het origineel getunede
// 1-4-3-2, maar nu voor een willekeurig aantal spelers per linie.
const LINE_LAYOUT: Record<FormationLine, { z: number; curve: number; width: number }> = {
  keeper: { z: -13.5, curve: 0, width: 0 },
  verdediging: { z: -7.5, curve: 1, width: 15 },
  middenveld: { z: -0.5, curve: 1, width: 12 },
  aanval: { z: 8, curve: 0, width: 7 },
};
const LINE_ORDER: FormationLine[] = ["keeper", "verdediging", "middenveld", "aanval"];

function layoutLine(line: FormationLine, count: number): [number, number, number][] {
  if (count <= 0) return [];
  const { z: baseZ, curve, width } = LINE_LAYOUT[line];
  const spacing = count > 1 ? width / (count - 1) : 0;
  const half = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => {
    const x = (i - half) * spacing;
    const maxOffset = half * spacing;
    const normalized = maxOffset > 0 ? Math.abs(x) / maxOffset : 0;
    const z = baseZ + curve * normalized * normalized;
    return [x, 0, z] as [number, number, number];
  });
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
  is_starter: boolean | null;
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
      "id, first_name, last_name, shirt_number, position, goals, yellow_cards, red_cards, matches_present, is_injured, photo_url, is_starter",
    )
    .eq("active", true)
    .order("shirt_number", { ascending: true, nullsFirst: false })
    .order("last_name", { ascending: true });

  // De view geeft `id` als nullable terug; spelers zonder id kunnen niet
  // voorkomen (players.id is de primary key), maar we filteren ze hier
  // expliciet weg zodat SquadPlayer.id altijd een string is.
  const squadRows = (squad ?? []).filter((p): p is SquadPlayer => p.id !== null);

  // Groepeer de basisspelers per linie (op volgorde van de query, dus al
  // gesorteerd op rugnummer/achternaam). Een basisspeler zonder (herkende)
  // positie kan niet op het veld geplaatst worden — die valt terug op de
  // bank, met "positie onbekend" als duidelijke hint om dat nog in te
  // vullen.
  const starterIdsByLine: Record<FormationLine, SquadPlayer[]> = {
    keeper: [],
    verdediging: [],
    middenveld: [],
    aanval: [],
  };
  const starterIds = new Set<string>();
  for (const row of squadRows) {
    if (!row.is_starter) continue;
    const line = lineForPosition(row.position);
    if (!line) continue;
    starterIdsByLine[line].push(row);
    starterIds.add(row.id);
  }

  const onPitch: StadiumPlayer[] = [];
  for (const line of LINE_ORDER) {
    const rows = starterIdsByLine[line];
    const coordinates = layoutLine(line, rows.length);
    rows.forEach((row, i) => {
      onPitch.push({
        id: row.id,
        name: displayName(row.first_name, row.last_name),
        initials: initialsOf(row.first_name, row.last_name),
        number: row.shirt_number,
        position: row.position,
        matches: row.matches_present ?? 0,
        goals: row.goals ?? 0,
        yellowCards: row.yellow_cards ?? 0,
        redCards: row.red_cards ?? 0,
        injured: row.is_injured ?? false,
        photoUrl: row.photo_url,
        coordinates: coordinates[i],
      });
    });
  }

  const benchRows = squadRows.filter((p) => !starterIds.has(p.id));
  const formationLabel = LINE_ORDER.filter((line) => line !== "keeper")
    .map((line) => starterIdsByLine[line].length)
    .join("-");

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
              formationLabel={formationLabel}
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
