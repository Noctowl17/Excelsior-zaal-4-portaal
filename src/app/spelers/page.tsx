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
      <h1 className="text-2xl font-bold tracking-tight">Spelers &amp; statistieken</h1>
      <p className="mt-2 text-muted">
        Aanwezigheid, doelpunten, assists en kaarten dit seizoen. Spelerskaarten
        met foto&apos;s volgen zodra die zijn aangeleverd.
      </p>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Kon spelers niet laden: {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {players?.map((p) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/60 hover:shadow-[0_10px_40px_-15px_rgba(74,222,128,0.35)]"
          >
            <div className="relative h-14 bg-gradient-to-r from-accent-strong to-accent">
              {p.shirt_number ? (
                <span className="absolute right-3 top-1 text-3xl font-black text-background/30">
                  {p.shirt_number}
                </span>
              ) : null}
            </div>
            <div className="-mt-8 flex flex-col items-center px-4 pb-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface bg-background text-lg font-bold text-accent">
                {p.first_name?.[0]}
                {p.last_name?.[0]}
              </div>
              <p className="mt-2 font-semibold">
                {p.first_name} {p.last_name}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted">
                {p.position ?? "positie onbekend"}
              </p>

              <dl className="mt-4 grid w-full grid-cols-3 gap-2 rounded-xl bg-background/60 py-3 text-center text-sm">
                <div>
                  <dt className="text-xs text-muted">Aanwezig</dt>
                  <dd className="font-semibold">{p.matches_present}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Goals</dt>
                  <dd className="font-semibold text-accent">{p.goals}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Assists</dt>
                  <dd className="font-semibold">{p.assists}</dd>
                </div>
              </dl>

              <div className="mt-3 flex justify-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-2.5 rounded-sm bg-warning" />{" "}
                  {p.yellow_cards}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-2.5 rounded-sm bg-danger" />{" "}
                  {p.red_cards}
                </span>
                <span>🤕 {p.matches_injured}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {players && players.length === 0 && (
        <p className="mt-6 text-muted">
          Nog geen spelers toegevoegd. Log in als staf om de eerste selectie
          in te voeren.
        </p>
      )}
    </div>
  );
}
