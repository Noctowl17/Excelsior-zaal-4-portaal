// Spelertype voor de 3D-stadion-hero op de homepage. Losstaand van het
// Supabase-rijtype: `page.tsx` mapt de live spelersdata naar deze vorm
// (inclusief een vaste 3D-positie op het veld per basisspeler).
export type StadiumPlayer = {
  id: string;
  name: string;
  initials: string;
  number: number | null;
  position: string | null;
  matches: number;
  goals: number;
  yellowCards: number;
  redCards: number;
  coordinates: [number, number, number];
};
