import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Wedstrijden - Excelsior'31 4",
};

const statusLabel: Record<string, string> = {
  scheduled: "Gepland",
  played: "Gespeeld",
  cancelled: "Afgelast",
};

const statusStyle: Record<string, string> = {
  scheduled: "bg-accent/15 text-accent",
  played: "bg-border text-muted",
  cancelled: "bg-danger/15 text-danger",
};

export default async function WedstrijdenPage() {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, location, status")
    .order("starts_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Speelschema</h1>
      <p className="mt-2 text-muted">
        Wordt automatisch bijgewerkt vanuit ons iCal-schema van Sportlink.
      </p>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Kon wedstrijden niet laden: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {matches?.map((m) => {
          const date = new Date(m.starts_at);
          return (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/50"
            >
              <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-background/60 py-2">
                <span className="text-xs font-semibold uppercase text-accent">
                  {date.toLocaleDateString("nl-NL", { month: "short" })}
                </span>
                <span className="text-xl font-bold">
                  {date.toLocaleDateString("nl-NL", { day: "numeric" })}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  <span className="mr-2 rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted">
                    {m.is_home ? "THUIS" : "UIT"}
                  </span>
                  tegen {m.opponent ?? "onbekende tegenstander"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {date.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.location ? ` · ${m.location}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  statusStyle[m.status] ?? "bg-border text-muted"
                }`}
              >
                {statusLabel[m.status] ?? m.status}
              </span>
            </div>
          );
        })}
      </div>

      {matches && matches.length === 0 && (
        <p className="mt-6 text-muted">
          Nog geen wedstrijden gesynchroniseerd. Draai het iCal-syncscript
          (zie README) om het speelschema op te halen.
        </p>
      )}
    </div>
  );
}
