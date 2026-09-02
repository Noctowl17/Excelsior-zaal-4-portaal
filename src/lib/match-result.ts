// Kleine, gedeelde helper om een wedstrijduitslag om te zetten naar "onze"
// score, de score van de tegenstander en winst/gelijk/verlies — zodat de
// speelschema-, wedstrijdbeheer- en spelerspagina's dit allemaal op dezelfde
// manier tonen. `is_home` wordt (net als in de database-view
// `player_stats_overview`) als "thuis" behandeld wanneer het onbekend (null)
// is, zodat beide precies hetzelfde resultaat berekenen.

export type MatchOutcome = "win" | "draw" | "loss";

export type MatchScoreInput = {
  is_home: boolean | null;
  home_score: number | null;
  away_score: number | null;
};

export type MatchScoreView = {
  ownScore: number;
  opponentScore: number;
  outcome: MatchOutcome;
};

export function getMatchScoreView(match: MatchScoreInput): MatchScoreView | null {
  if (match.home_score == null || match.away_score == null) return null;

  const isHome = match.is_home ?? true;
  const ownScore = isHome ? match.home_score : match.away_score;
  const opponentScore = isHome ? match.away_score : match.home_score;
  const outcome: MatchOutcome =
    ownScore > opponentScore ? "win" : ownScore < opponentScore ? "loss" : "draw";

  return { ownScore, opponentScore, outcome };
}

export const outcomeLabel: Record<MatchOutcome, string> = {
  win: "Gewonnen",
  draw: "Gelijk",
  loss: "Verloren",
};

// Tailwind-klassen voor een klein badge/pil per uitslag, in dezelfde stijl
// als de bestaande status-pillen (zie o.a. src/app/wedstrijden/page.tsx).
export const outcomeBadgeStyle: Record<MatchOutcome, string> = {
  win: "bg-accent/15 text-accent",
  draw: "bg-border text-muted",
  loss: "bg-danger/15 text-danger",
};
