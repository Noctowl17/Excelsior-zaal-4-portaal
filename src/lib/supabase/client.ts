import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Client voor gebruik in Client Components (browser). Gebruikt de publieke
// (publishable/anon) sleutel - deze mag zonder problemen in de browser staan,
// Row Level Security in de database bepaalt wat er echt op te vragen/te wijzigen is.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
