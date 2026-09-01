import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// "Broadcast" landing-ontwerp (ontwerp 1a uit Claude Design): donkere studio,
// rood accent, spelers op een 3D-veld met hover-kaarten. Dit is een bewust
// afwijkende, op zichzelf staande stijl voor de homepage - de rest van de
// site (header, spelers/wedstrijden/login/beheer) houdt het bestaande
// donker/groene thema.

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

const oswald = { fontFamily: "'Oswald', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const sans = { fontFamily: "'IBM Plex Sans', sans-serif" };

// Vaste veldposities voor de eerste 5 spelers (1-2-1-1 opstelling), in
// procenten van de veldbreedte/-hoogte. Zodra spelers een echte positie
// (keeper/verdediger/...) hebben ingevuld kan dit slimmer gekoppeld worden -
// nu simpelweg gevuld op volgorde van rugnummer.
const PITCH_SLOTS = [
  { x: 12, y: 50 },
  { x: 33, y: 26 },
  { x: 33, y: 74 },
  { x: 56, y: 50 },
  { x: 80, y: 52 },
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

function StatCard({ player }: { player: SquadPlayer }) {
  return (
    <div
      className="w-[216px] border border-white/10 bg-[#14181b]"
      style={{ borderTop: "3px solid #c8102e", boxShadow: "0 24px 50px rgba(0,0,0,.6)" }}
    >
      <div className="flex gap-2.5 p-3">
        <div
          className="flex h-16 w-[52px] flex-none items-end justify-center pb-1"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#22282d 0 5px,#1a1f23 5px 10px)",
          }}
        >
          <span className="text-[7px] tracking-wide text-[#6d757c]" style={mono}>
            FOTO
          </span>
        </div>
        <div className="min-w-0 text-left">
          <div className="truncate text-[15px] font-semibold uppercase leading-tight" style={oswald}>
            {player.first_name} {player.last_name}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-[#8a9199]" style={mono}>
            {player.position ? `${player.position} · ` : ""}#{player.shirt_number ?? "-"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-white/10">
        <div className="border-r border-white/10 px-1 py-2.5 text-center">
          <div className="text-[19px] font-semibold" style={oswald}>
            {player.goals ?? 0}
          </div>
          <div className="mt-0.5 text-[8px] tracking-wider text-[#8a9199]" style={mono}>
            GOALS
          </div>
        </div>
        <div className="border-r border-white/10 px-1 py-2.5 text-center">
          <div className="text-[19px] font-semibold text-[#f2c200]" style={oswald}>
            {player.yellow_cards ?? 0}
          </div>
          <div className="mt-0.5 text-[8px] tracking-wider text-[#8a9199]" style={mono}>
            GEEL
          </div>
        </div>
        <div className="border-r border-white/10 px-1 py-2.5 text-center">
          <div className="text-[19px] font-semibold text-[#c8102e]" style={oswald}>
            {player.red_cards ?? 0}
          </div>
          <div className="mt-0.5 text-[8px] tracking-wider text-[#8a9199]" style={mono}>
            ROOD
          </div>
        </div>
        <div className="px-1 py-2.5 text-center">
          <div className="text-[19px] font-semibold" style={oswald}>
            {player.matches_present ?? 0}
          </div>
          <div className="mt-0.5 text-[8px] tracking-wider text-[#8a9199]" style={mono}>
            DUELS
          </div>
        </div>
      </div>
    </div>
  );
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
  // voorkomen (players.id is de primary key), maar we filteren ze hier expliciet
  // weg zodat SquadPlayer.id altijd een string is.
  const squadRows = (squad ?? []).filter((p): p is SquadPlayer => p.id !== null);

  const onPitch = squadRows.slice(0, 5);
  const bench = squadRows.slice(5);

  const { data: attendanceRows } = await supabase.from("attendance").select("match_id");
  const played = new Set((attendanceRows ?? []).map((a) => a.match_id)).size;

  const { data: statsRows } = await supabase.from("match_stats").select("goals");
  const goalsFor = (statsRows ?? []).reduce((sum, r) => sum + (r.goals ?? 0), 0);

  const { data: cardRows } = await supabase.from("cards").select("card_type");
  const yellows = (cardRows ?? []).filter((c) => c.card_type === "yellow").length;
  const reds = (cardRows ?? []).filter((c) => c.card_type === "red").length;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-6">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_LINK} />
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e10] text-[#f2f3f4]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          {/* Hoofdkolom: opstelling op het veld */}
          <div className="p-6 sm:p-8">
            <div className="text-[11px] uppercase tracking-[.2em] text-[#c8102e]" style={mono}>
              Seizoen {new Date().getFullYear()}
            </div>
            <h1
              className="mt-3 text-4xl uppercase leading-[.94] tracking-tight sm:text-6xl"
              style={{ ...oswald, fontWeight: 600 }}
            >
              De basisvijf
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#8a9199]" style={sans}>
              {squadRows.length > 0
                ? `${squadRows.length} spelers in de huidige selectie. Ga met je muis over een naam voor de cijfers dit seizoen.`
                : "Nog geen spelers toegevoegd."}
            </p>

            {onPitch.length > 0 && (
              <div
                className="relative mt-7 h-[280px] sm:h-[360px] lg:h-[430px]"
                style={{ perspective: 1000, perspectiveOrigin: "50% 22%" }}
              >
                <div
                  className="absolute inset-0 border-2 border-white/40"
                  style={{
                    transformOrigin: "50% 100%",
                    transform: "rotateX(54deg) scale(1.02)",
                    backgroundImage:
                      "repeating-linear-gradient(90deg,#1d6b3c 0 60px,#1a6136 60px 120px)",
                    boxShadow: "0 40px 80px rgba(0,0,0,.55)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/35" />
                  <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
                  <div className="absolute left-0 top-1/2 h-[44%] w-[16%] -translate-y-1/2 border-2 border-l-0 border-white/35" />
                  <div className="absolute right-0 top-1/2 h-[44%] w-[16%] -translate-y-1/2 border-2 border-r-0 border-white/35" />

                  {onPitch.map((player, i) => {
                    const slot = PITCH_SLOTS[i] ?? PITCH_SLOTS[PITCH_SLOTS.length - 1];
                    return (
                      <div
                        key={player.id}
                        className="group absolute"
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          transform: "translate(-50%,-50%) rotateX(-54deg)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div className="relative flex cursor-pointer flex-col items-center gap-1.5">
                          <div
                            className="relative h-[62px] w-[62px] rounded-full border-2 border-white/85 transition group-hover:-translate-y-1 group-hover:border-[#c8102e]"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(135deg,#20262b 0 6px,#171c20 6px 12px)",
                              boxShadow: "0 12px 22px rgba(0,0,0,.5)",
                            }}
                          >
                            <div
                              className="absolute -bottom-1.5 -right-1.5 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#c8102e] text-xs font-semibold text-white"
                              style={oswald}
                            >
                              {player.shirt_number ?? "-"}
                            </div>
                          </div>
                          <div
                            className="whitespace-nowrap border border-white/15 bg-[#0c0e10]/85 px-2 py-0.5 text-[10px] font-medium tracking-wide"
                            style={sans}
                          >
                            {player.last_name}
                          </div>
                        </div>
                        <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-50 -translate-x-1/2 translate-y-1.5 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                          <StatCard player={player} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {bench.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="text-[10px] uppercase tracking-[.2em] text-[#8a9199]"
                    style={mono}
                  >
                    Bank
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {bench.map((player) => (
                    <div key={player.id} className="group relative">
                      <div
                        className="flex cursor-pointer items-center gap-2.5 border border-white/10 bg-[#14181b] p-2.5 transition group-hover:border-[#c8102e]"
                      >
                        <div
                          className="h-[42px] w-[34px] flex-none"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(135deg,#22282d 0 5px,#1a1f23 5px 10px)",
                          }}
                        />
                        <div className="min-w-0">
                          <div
                            className="truncate text-[13px] font-semibold uppercase leading-tight"
                            style={oswald}
                          >
                            {player.last_name}
                          </div>
                          <div
                            className="mt-0.5 text-[9px] tracking-wider text-[#8a9199]"
                            style={mono}
                          >
                            #{player.shirt_number ?? "-"}
                          </div>
                        </div>
                      </div>
                      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 -translate-x-1/2 translate-y-1.5 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                        <StatCard player={player} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zijkolom: eerstvolgende wedstrijd + seizoenstotalen */}
          <div className="flex flex-col gap-6 border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div>
              <div className="text-[10px] uppercase tracking-[.2em] text-[#8a9199]" style={mono}>
                Eerstvolgende wedstrijd
              </div>
              <div className="mt-3 border border-white/10 bg-[#14181b] p-4">
                {nextMatch ? (
                  <>
                    <div className="text-[10px] tracking-wider text-[#c8102e]" style={mono}>
                      {new Date(nextMatch.starts_at)
                        .toLocaleString("nl-NL", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .toUpperCase()}{" "}
                      · {nextMatch.is_home ? "THUIS" : "UIT"}
                    </div>
                    <div
                      className="mt-3 flex items-center justify-between gap-2 text-[15px] font-semibold uppercase leading-tight"
                      style={oswald}
                    >
                      <span>Excelsior&apos;31 4</span>
                      <span className="text-xs font-normal text-[#8a9199]">vs</span>
                      <span className="truncate">
                        {nextMatch.opponent ?? "onbekend"}
                      </span>
                    </div>
                    {nextMatch.location && (
                      <div className="mt-3 text-[11px] leading-relaxed text-[#8a9199]" style={sans}>
                        {nextMatch.location}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[12px] text-[#8a9199]" style={sans}>
                    Nog geen wedstrijden bekend.
                  </p>
                )}
              </div>
              <Link
                href="/wedstrijden"
                className="mt-3 inline-block text-[11px] tracking-wider text-[#c8102e] hover:underline"
                style={mono}
              >
                HEEL SPEELSCHEMA &rarr;
              </Link>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[.2em] text-[#8a9199]" style={mono}>
                Seizoenstotalen
              </div>
              <div className="mt-3 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
                <div className="bg-[#14181b] p-3.5">
                  <div className="text-[26px] font-semibold" style={oswald}>
                    {played}
                  </div>
                  <div className="mt-1 text-[9px] tracking-wider text-[#8a9199]" style={mono}>
                    GESPEELD
                  </div>
                </div>
                <div className="bg-[#14181b] p-3.5">
                  <div className="text-[26px] font-semibold" style={oswald}>
                    {goalsFor}
                  </div>
                  <div className="mt-1 text-[9px] tracking-wider text-[#8a9199]" style={mono}>
                    DOELPUNTEN
                  </div>
                </div>
                <div className="bg-[#14181b] p-3.5">
                  <div className="text-[26px] font-semibold text-[#f2c200]" style={oswald}>
                    {yellows}
                  </div>
                  <div className="mt-1 text-[9px] tracking-wider text-[#8a9199]" style={mono}>
                    GEEL
                  </div>
                </div>
                <div className="bg-[#14181b] p-3.5">
                  <div className="text-[26px] font-semibold text-[#c8102e]" style={oswald}>
                    {reds}
                  </div>
                  <div className="mt-1 text-[9px] tracking-wider text-[#8a9199]" style={mono}>
                    ROOD
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/spelers"
              className="mt-1 inline-block text-[11px] tracking-wider text-[#c8102e] hover:underline"
              style={mono}
            >
              ALLE SPELERS &amp; STATISTIEKEN &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
