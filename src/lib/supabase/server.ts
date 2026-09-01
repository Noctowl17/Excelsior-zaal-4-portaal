import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// Client voor gebruik in Server Components, Route Handlers en Server Actions.
// Leest/schrijft de sessie-cookie van de ingelogde staf-gebruiker, zodat
// Row Level Security de juiste rechten toepast (publiek lezen, staf schrijven).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Kan genegeerd worden als dit vanuit een Server Component wordt
            // aangeroepen met middleware die de sessie ververst.
          }
        },
      },
    },
  );
}
