"use client";

import dynamic from "next/dynamic";
import type { StadiumPlayer } from "./types";

// Losse client-wrapper zodat `next/dynamic(..., { ssr: false })` gebruikt kan
// worden vanuit de (async) Server Component `page.tsx` — dat mag niet
// rechtstreeks vanuit een Server Component, wel vanuit een "use client"
// bestand zoals dit. De 3D-scene (drei/three/fiber) heeft toch geen zinnige
// server-render, dus laden we 'm alleen client-side, met een simpele
// skeleton als placeholder terwijl de scene opstart.
const FootballExperience = dynamic(
  () => import("./FootballExperience").then((mod) => mod.FootballExperience),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center border border-border bg-surface text-sm text-muted"
        style={{ height: "clamp(32rem, 92vh, 60rem)" }}
      >
        Veld wordt geladen…
      </div>
    ),
  },
);

type FootballExperienceClientProps = {
  players: StadiumPlayer[];
  clubName: string;
  formationLabel: string;
  seasonLabel: string;
};

export function FootballExperienceClient(props: FootballExperienceClientProps) {
  return <FootballExperience {...props} />;
}
