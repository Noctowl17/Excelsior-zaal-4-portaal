import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Spelers - Excelsior'31 4",
};

export default async function SpelersPage() {
  const supabase = await createClient();

  const { data: players, error } = await supabase
    .from("player_stats_overview")
    .select("*")
    .order("last_name", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Spelers &amp; statistieken</h1>
      <p className="mt-2 text-neutral-600">
        Aanwezigheid, doelpunten, assists en kaarten dit seizoen. Spelerskaarten
        met foto&apos;s volgen zodra die zijn aangeleverd.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          Kon spelers niet laden: {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players?.map((p) => (
          <div key={p.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                {p.first_name?.[0]}
                {p.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium">
                  {p.first_name} {p.last_name}
                  {p.shirt_number ? ` (#${p.shirt_number})` : ""}
                </p>
                <p className="text-xs text-neutral-500">
                  {p.position ?? "positie onbekend"}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <dt className="text-neutral-500">Aanwezig</dt>
                <dd className="font-semibold">{p.matches_present}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Goals</dt>
                <dd className="font-semibold">{p.goals}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Assists</dt>
                <dd className="font-semibold">{p.assists}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-center gap-3 text-xs text-neutral-500">
              <span>🟨 {p.yellow_cards}</span>
              <span>🟥 {p.red_cards}</span>
              <span>🤕 {p.matches_injured}</span>
            </div>
          </div>
        ))}
      </div>

      {players && players.length === 0 && (
        <p className="mt-6 text-neutral-500">
          Nog geen spelers toegevoegd. Log in als staf om de eerste selectie
          in te voeren.
        </p>
      )}
    </div>
  );
}
