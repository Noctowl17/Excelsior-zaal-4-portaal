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

  const { error } = await supabase
    .from("players")
    .update({ first_name, last_name, shirt_number, position, birth_date, active })
    .eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidatePath("/beheer/spelers");
  revalidatePath("/spelers");
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
