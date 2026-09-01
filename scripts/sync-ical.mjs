// Haalt het speelschema op uit de iCal-feed van Sportlink en zet de
// wedstrijden in de `matches`-tabel in Supabase. Bedoeld om via een cron-job
// op de Linux server periodiek te draaien (zie README.md), NIET vanuit de
// browser - dit script gebruikt de service_role sleutel die alle
// Row Level Security omzeilt en dus geheim moet blijven.
//
// Gebruik:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ICAL_URL=... TEAM_NAME="Excelsior'31 4" \
//     node scripts/sync-ical.mjs

import ical from "node-ical";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ICAL_URL = process.env.ICAL_URL;
const TEAM_NAME = process.env.TEAM_NAME ?? "Excelsior'31 4";

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ICAL_URL,
})) {
  if (!value) {
    console.error(`Ontbrekende omgevingsvariabele: ${name}`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function guessIsHome(summary) {
  if (!summary) return null;
  // Sportlink zet meestal "Thuisteam - Uitteam" in de titel.
  const [first] = summary.split(/\s+-\s+/);
  if (!first) return null;
  return first.toLowerCase().includes(TEAM_NAME.toLowerCase());
}

function guessOpponent(summary) {
  if (!summary) return null;
  const parts = summary.split(/\s+-\s+/).map((p) => p.trim());
  if (parts.length < 2) return summary;
  const [a, b] = parts;
  const teamIsA = a.toLowerCase().includes(TEAM_NAME.toLowerCase());
  return teamIsA ? b : a;
}

async function main() {
  console.log(`Ophalen iCal-schema...`);
  const events = await ical.async.fromURL(ICAL_URL);

  const matches = Object.values(events)
    .filter((e) => e.type === "VEVENT" && e.start)
    .map((e) => ({
      ical_uid: e.uid,
      starts_at: new Date(e.start).toISOString(),
      opponent: guessOpponent(e.summary),
      is_home: guessIsHome(e.summary),
      location: e.location ?? null,
      updated_at: new Date().toISOString(),
    }));

  if (matches.length === 0) {
    console.log("Geen wedstrijden gevonden in de iCal-feed.");
    return;
  }

  console.log(`${matches.length} wedstrijden gevonden, wegschrijven naar Supabase...`);

  const { error } = await supabase
    .from("matches")
    .upsert(matches, { onConflict: "ical_uid" });

  if (error) {
    console.error("Fout bij wegschrijven naar Supabase:", error.message);
    process.exit(1);
  }

  console.log("Klaar. Speelschema is bijgewerkt.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
