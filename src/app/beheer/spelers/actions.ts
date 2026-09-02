"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStaffContext } from "@/lib/staff";

export async function createPlayer(formData: FormData) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  if (!first_name || !last_name) {
    throw new Error("Voor- en achternaam zijn verplicht.");
  }

  const shirtRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtRaw ? Number(shirtRaw) : null;
  const position = String(formData.get("position") ?? "").trim() || null;
  const birthRaw = String(formData.get("birth_date") ?? "").trim();
  const birth_date = birthRaw || null;

  const { error } = await supabase.from("players").insert({
    first_name,
    last_name,
    shirt_number,
    position,
    birth_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/beheer/spelers");
  revalidatePath("/spelers");
}

export async function updatePlayer(playerId: string, formData: FormData) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  if (!first_name || !last_name) {
    throw new Error("Voor- en achternaam zijn verplicht.");
  }

  const shirtRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtRaw ? Number(shirtRaw) : null;
  const position = String(formData.get("position") ?? "").trim() || null;
  const birthRaw = String(formData.get("birth_date") ?? "").trim();
  const birth_date = birthRaw || null;
  const active = formData.get("active") === "on";
  const injured = formData.get("injured") === "on";

  const { error } = await supabase
    .from("players")
    .update({ first_name, last_name, shirt_number, position, birth_date, active })
    .eq("id", playerId);
  if (error) throw new Error(error.message);

  // "Geblesseerd" is geen kolom op players, maar stuurt de bestaande
  // blessuretabel aan (zie ook /beheer/blessures): vinkje aan zet een
  // nieuwe actieve blessure, vinkje uit meldt de actieve blessure(s)
  // hersteld. Zo blijft er precies één bron van waarheid.
  const { data: activeInjuries, error: activeInjuriesError } = await supabase
    .from("injuries")
    .select("id")
    .eq("player_id", playerId)
    .eq("status", "active");
  if (activeInjuriesError) throw new Error(activeInjuriesError.message);

  if (injured && (activeInjuries ?? []).length === 0) {
    const { error: insertError } = await supabase.from("injuries").insert({
      player_id: playerId,
      start_date: new Date().toISOString().slice(0, 10),
    });
    if (insertError) throw new Error(insertError.message);
  } else if (!injured && (activeInjuries ?? []).length > 0) {
    const { error: recoverError } = await supabase
      .from("injuries")
      .update({ status: "recovered" })
      .eq("player_id", playerId)
      .eq("status", "active");
    if (recoverError) throw new Error(recoverError.message);
  }

  revalidatePath("/beheer/spelers");
  revalidatePath("/beheer/blessures");
  revalidatePath("/spelers");
  revalidatePath("/");
  redirect("/beheer/spelers");
}

export async function togglePlayerActive(playerId: string, active: boolean) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const { error } = await supabase
    .from("players")
    .update({ active })
    .eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidatePath("/beheer/spelers");
  revalidatePath("/spelers");
}
