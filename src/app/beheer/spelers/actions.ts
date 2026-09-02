"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStaffContext } from "@/lib/staff";
import type { SupabaseClient } from "@supabase/supabase-js";

const PHOTO_BUCKET = "player-photos";
const PHOTO_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Haalt het pad binnen de bucket uit een eerder opgeslagen publieke
// Storage-URL, zodat we de oude foto kunnen opruimen bij een vervanging of
// verwijdering. Geeft `null` terug voor een leeg/onbekend/extern veld, dan
// slaan we het opruimen gewoon over (geen fatale fout waard).
function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

// Upload een nieuwe spelersfoto (indien meegegeven) en geeft de publieke URL
// terug. Ruimt de vorige foto op zodat de bucket niet vol raakt met oude
// bestanden. Gooit een duidelijke fout bij een ongeldig/te groot bestand i.p.v.
// een cryptische Storage-foutmelding.
async function uploadPlayerPhoto(
  supabase: SupabaseClient,
  playerId: string,
  previousPhotoUrl: string | null,
  file: File,
): Promise<string> {
  const ext = PHOTO_MIME_EXT[file.type];
  if (!ext) {
    throw new Error("Alleen JPG, PNG of WEBP-afbeeldingen zijn toegestaan.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("De foto is groter dan 5 MB.");
  }

  const path = `${playerId}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (uploadError) throw new Error(uploadError.message);

  const previousPath = storagePathFromPublicUrl(previousPhotoUrl);
  if (previousPath) {
    // Best-effort: als opruimen mislukt, laten we de nieuwe upload gewoon
    // staan i.p.v. de hele actie te laten falen op een oud bestand.
    await supabase.storage.from(PHOTO_BUCKET).remove([previousPath]);
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

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
  const is_starter = formData.get("is_starter") === "on";

  const { error } = await supabase.from("players").insert({
    first_name,
    last_name,
    shirt_number,
    position,
    birth_date,
    is_starter,
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
  const is_starter = formData.get("is_starter") === "on";
  const injured = formData.get("injured") === "on";
  const removePhoto = formData.get("remove_photo") === "on";
  const photoFile = formData.get("photo");

  const { data: currentPlayer, error: currentPlayerError } = await supabase
    .from("players")
    .select("photo_url")
    .eq("id", playerId)
    .maybeSingle();
  if (currentPlayerError) throw new Error(currentPlayerError.message);
  const previousPhotoUrl = currentPlayer?.photo_url ?? null;

  // Een leeg bestandsveld komt binnen als een `File` met size 0 — alleen een
  // echt gekozen bestand verwerken we als upload.
  let photo_url = previousPhotoUrl;
  if (photoFile instanceof File && photoFile.size > 0) {
    photo_url = await uploadPlayerPhoto(supabase, playerId, previousPhotoUrl, photoFile);
  } else if (removePhoto && previousPhotoUrl) {
    const previousPath = storagePathFromPublicUrl(previousPhotoUrl);
    if (previousPath) {
      await supabase.storage.from(PHOTO_BUCKET).remove([previousPath]);
    }
    photo_url = null;
  }

  const { error } = await supabase
    .from("players")
    .update({ first_name, last_name, shirt_number, position, birth_date, active, is_starter, photo_url })
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
