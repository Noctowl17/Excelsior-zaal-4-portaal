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
        Aanwezigheid, doelpunten, assists en kaarten dit seizoen.
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
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/60 hover:shadow-[0_10px_40px_-15px_rgba(220,38,38,0.35)]"
          >
            <div className="relative h-40 w-full">
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- vaste kaartkop; next/image is hier overkill.
                <img
                  src={p.photo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-strong to-accent">
                  <span className="text-4xl font-bold text-accent-foreground/90">
                    {p.first_name?.[0]}
                    {p.last_name?.[0]}
                  </span>
                </div>
              )}
              {p.photo_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              )}
              {p.shirt_number ? (
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-lg">
                  {p.shirt_number}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col items-center px-4 pb-4 pt-4 text-center">
              <p className="font-semibold">
                {p.first_name} {p.last_name}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted">
                {p.position ?? "positie onbekend"}
              </p>

              <dl className="mt-4 grid w-full grid-cols-4 gap-2 rounded-xl bg-background/60 py-3 text-center text-sm">
                <div>
                  <dt className="text-xs text-muted">Aanwezig</dt>
                  <dd className="font-semibold">{p.matches_present}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Gewonnen</dt>
                  <dd className="font-semibold text-accent">{p.matches_won}</dd>
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
