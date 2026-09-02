import Link from "next/link";
import { notFound } from "next/navigation";
import { getStaffContext } from "@/lib/staff";
import { updatePlayer } from "../actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function EditPlayerPage({
  params,
}: PageProps<"/beheer/spelers/[id]">) {
  const { id } = await params;
  const { supabase } = await getStaffContext();

  const { data: player } = await supabase
    .from("players")
    .select("id, first_name, last_name, shirt_number, position, birth_date, active, photo_url")
    .eq("id", id)
    .maybeSingle();

  if (!player) {
    notFound();
  }

  // "Geblesseerd" is geen los veld op players, maar leidt af of er een
  // actieve rij in de bestaande blessuretabel staat (zie ook
  // /beheer/blessures) — zo blijft er één bron van waarheid.
  const { data: activeInjury } = await supabase
    .from("injuries")
    .select("id")
    .eq("player_id", player.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const updatePlayerWithId = updatePlayer.bind(null, player.id);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">
        {player.first_name} {player.last_name} bewerken
      </h1>
      <form action={updatePlayerWithId} className="mt-6 space-y-3">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-background px-3 py-3">
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- vast avatarformaat; next/image is hier overkill.
            <img
              src={player.photo_url}
              alt=""
              className="h-16 w-16 flex-none rounded-full object-cover"
            />
          ) : (
            <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-surface text-lg font-semibold text-muted">
              {player.first_name?.[0]}
              {player.last_name?.[0]}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <label className="block text-xs text-muted">
              {player.photo_url ? "Nieuwe foto uploaden" : "Foto uploaden"}
              <input
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-foreground hover:file:bg-accent-strong"
              />
            </label>
            {player.photo_url && (
              <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  name="remove_photo"
                  className="h-3.5 w-3.5 rounded border-border"
                />
                Huidige foto verwijderen
              </label>
            )}
          </div>
        </div>
        <input
          name="first_name"
          defaultValue={player.first_name}
          required
          placeholder="Voornaam"
          className={inputClass}
        />
        <input
          name="last_name"
          defaultValue={player.last_name}
          required
          placeholder="Achternaam"
          className={inputClass}
        />
        <input
          name="shirt_number"
          type="number"
          min={0}
          defaultValue={player.shirt_number ?? ""}
          placeholder="Rugnummer"
          className={inputClass}
        />
        <input
          name="position"
          defaultValue={player.position ?? ""}
          placeholder="Positie"
          className={inputClass}
        />
        <label className="block text-xs text-muted">
          Geboortedatum
          <input
            name="birth_date"
            type="date"
            defaultValue={player.birth_date ?? ""}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="active"
            defaultChecked={player.active}
            className="h-4 w-4 rounded border-border"
          />
          Actief in de selectie
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="injured"
            defaultChecked={!!activeInjury}
            className="h-4 w-4 rounded border-border"
          />
          Geblesseerd
        </label>
        <p className="text-xs text-muted">
          Dit zet een blessure op &quot;actief&quot; of &quot;hersteld&quot;
          in het blessureoverzicht. Voor een startdatum of omschrijving:
          gebruik{" "}
          <Link href="/beheer/blessures" className="text-accent hover:underline">
            Blessures
          </Link>
          .
        </p>
        <button
          type="submit"
          className="w-full rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground transition hover:bg-accent-strong"
        >
          Opslaan
        </button>
      </form>
    </div>
  );
}
