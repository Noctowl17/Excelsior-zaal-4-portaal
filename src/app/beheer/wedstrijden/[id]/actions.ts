"use server";

import { revalidatePath } from "next/cache";
import { getStaffContext } from "@/lib/staff";

const ATTENDANCE_VALUES = ["present", "absent", "excused", "injured"];
const CARD_TYPES = ["yellow", "red"];

export async function saveMatchEntry(matchId: string, formData: FormData) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id")
    .eq("active", true);
  if (playersError) throw new Error(playersError.message);
  if (!players || players.length === 0) return;

  const attendanceRows = players.map((player) => {
    const raw = String(formData.get(`attendance_${player.id}`) ?? "present");
    const status = ATTENDANCE_VALUES.includes(raw) ? raw : "present";
    return { match_id: matchId, player_id: player.id, status };
  });

  const statsRows = players.map((player) => {
    const goalsRaw = formData.get(`goals_${player.id}`);
    const assistsRaw = formData.get(`assists_${player.id}`);
    const goals = goalsRaw ? Math.max(0, Number(goalsRaw) || 0) : 0;
    const assists = assistsRaw ? Math.max(0, Number(assistsRaw) || 0) : 0;
    return { match_id: matchId, player_id: player.id, goals, assists };
  });

  const { error: attendanceError } = await supabase
    .from("attendance")
    .upsert(attendanceRows, { onConflict: "match_id,player_id" });
  if (attendanceError) throw new Error(attendanceError.message);

  const { error: statsError } = await supabase
    .from("match_stats")
    .upsert(statsRows, { onConflict: "match_id,player_id" });
  if (statsError) throw new Error(statsError.message);

  revalidatePath(`/beheer/wedstrijden/${matchId}`);
  revalidatePath("/spelers");
  revalidatePath("/");
}

export async function addCard(matchId: string, formData: FormData) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const player_id = String(formData.get("player_id") ?? "");
  const card_type = String(formData.get("card_type") ?? "");
  const minuteRaw = String(formData.get("minute") ?? "").trim();
  const minute = minuteRaw ? Math.max(0, Number(minuteRaw) || 0) : null;

  if (!player_id || !CARD_TYPES.includes(card_type)) {
    throw new Error("Kies een speler en een kaarttype.");
  }

  const { error } = await supabase.from("cards").insert({
    match_id: matchId,
    player_id,
    card_type,
    minute,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/beheer/wedstrijden/${matchId}`);
  revalidatePath("/spelers");
}

export async function deleteCard(matchId: string, cardId: string) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);

  revalidatePath(`/beheer/wedstrijden/${matchId}`);
  revalidatePath("/spelers");
}
