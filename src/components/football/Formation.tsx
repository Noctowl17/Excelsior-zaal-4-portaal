"use client";

import type { StadiumPlayer } from "./types";
import { PlayerCard } from "./PlayerCard";

type FormationProps = {
  players: StadiumPlayer[];
  activeId: string | null;
  introComplete: boolean;
  onActivate: (id: string | null) => void;
};

export function Formation({ players, activeId, introComplete, onActivate }: FormationProps) {
  return (
    <group>
      {players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          index={index}
          active={activeId === player.id}
          muted={activeId !== null && activeId !== player.id}
          introComplete={introComplete}
          onActivate={onActivate}
        />
      ))}
    </group>
  );
}
