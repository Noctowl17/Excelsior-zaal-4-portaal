"use server";

import { revalidatePath } from "next/cache";
import { getStaffContext } from "@/lib/staff";

export async function addInjury(formData: FormData) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const player_id = String(formData.get("player_id") ?? "");
  const start_date = String(formData.get("start_date") ?? "");
  const expectedRaw = String(formData.get("expected_return_date") ?? "").trim();
  const expected_return_date = expectedRaw || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!player_id || !start_date) {
    throw new Error("Speler en startdatum zijn verplicht.");
  }

  const { error } = await supabase.from("injuries").insert({
    player_id,
    start_date,
    expected_return_date,
    description,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/beheer/blessures");
  revalidatePath("/spelers");
}

export async function markInjuryRecovered(injuryId: string) {
  const { supabase, isStaff } = await getStaffContext();
  if (!isStaff) throw new Error("Geen stafrechten.");

  const { error } = await supabase
    .from("injuries")
    .update({ status: "recovered" })
    .eq("id", injuryId);
  if (error) throw new Error(error.message);

  revalidatePath("/beheer/blessures");
  revalidatePath("/spelers");
}
