import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Wedstrijden - Excelsior'31 4",
};

const statusLabel: Record<string, string> = {
  scheduled: "Gepland",
  played: "Gespeeld",
  cancelled: "Afgelast",
};

export default async function WedstrijdenPage() {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, starts_at, opponent, is_home, location, status")
    .order("starts_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Speelschema</h1>
      <p className="mt-2 text-neutral-600">
        Wordt automatisch bijgewerkt vanuit ons iCal-schema van Sportlink.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          Kon wedstrijden niet laden: {error.message}
        </p>
      )}

      <div className="mt-6 divide-y rounded-lg border bg-white">
        {matches?.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">
                {m.is_home ? "Thuis" : "Uit"} tegen{" "}
                {m.opponent ?? "onbekende tegenstander"}
              </p>
              <p className="text-sm text-neutral-500">
                {new Date(m.starts_at).toLocaleString("nl-NL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {m.location ? ` - ${m.location}` : ""}
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {statusLabel[m.status] ?? m.status}
            </span>
          </div>
        ))}
      </div>

      {matches && matches.length === 0 && (
        <p className="mt-6 text-neutral-500">
          Nog geen wedstrijden gesynchroniseerd. Draai het iCal-syncscript
          (zie README) om het speelschema op te halen.
        </p>
      )}
    </div>
  );
}
