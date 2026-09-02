// De vier posities die de 3D-basisopstelling op de homepage kan tekenen.
// Bewust een vaste, beperkte lijst i.p.v. vrije tekst (zoals voorheen) —
// zo komt een speler altijd betrouwbaar op de juiste linie in de
// opstelling terecht, zonder tikfoutgevoelige matching.
export const PLAYER_POSITIONS = ["Keeper", "Verdediger", "Middenvelder", "Aanvaller"] as const;
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export type FormationLine = "keeper" | "verdediging" | "middenveld" | "aanval";

const LINE_BY_POSITION: Record<PlayerPosition, FormationLine> = {
  Keeper: "keeper",
  Verdediger: "verdediging",
  Middenvelder: "middenveld",
  Aanvaller: "aanval",
};

// Geeft `null` voor een lege/onbekende positie (bv. nog niet ingevuld, of
// een oude vrije-tekstwaarde van vóór de vaste lijst) — zo'n speler kan dan
// niet op het veld geplaatst worden en valt terug op de bank.
export function lineForPosition(position: string | null): FormationLine | null {
  if (!position) return null;
  return LINE_BY_POSITION[position as PlayerPosition] ?? null;
}
