"use client";

import { Bandage } from "lucide-react";
import type { StadiumPlayer } from "./types";

// Gedeelde inhoud van het portret-vlak (foto/placeholder + rugnummer,
// positie en blessure-badge), gebruikt door zowel de 3D-spelerskaart
// (PlayerCard) als de gecentreerde mobiele overlay (MobilePlayerOverlay) —
// zo blijven beide weergaves visueel identiek.
export function PlayerPortrait({ player }: { player: StadiumPlayer }) {
  return (
    <>
      {player.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- vaste portret-tegel; next/image is hier overkill.
        <img src={player.photoUrl} alt="" className="portrait-photo" loading="lazy" />
      ) : (
        <span className="portrait-placeholder" aria-hidden="true">
          <span className="portrait-initials">{player.initials}</span>
        </span>
      )}
      <span className="shirt-number">{player.number ?? "-"}</span>
      <span className="position-tag">{player.position ?? ""}</span>
      {player.injured && (
        <span className="injury-badge" title="Geblesseerd">
          <Bandage aria-hidden="true" />
          <span className="sr-only">Geblesseerd</span>
        </span>
      )}
    </>
  );
}
