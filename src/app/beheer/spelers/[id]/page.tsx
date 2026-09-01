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
    .select("id, first_name, last_name, shirt_number, position, birth_date, active")
    .eq("id", id)
    .maybeSingle();

  if (!player) {
    notFound();
  }

  const updatePlayerWithId = updatePlayer.bind(null, player.id);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">
        {player.first_name} {player.last_name} bewerken
      </h1>
      <form action={updatePlayerWithId} className="mt-6 space-y-3">
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
