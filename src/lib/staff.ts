import { createClient } from "@/lib/supabase/server";

// Haalt de ingelogde gebruiker op en checkt of die ook in staff_users staat
// (dus echt mag schrijven). RLS handhaaft dit sowieso op databaseniveau; dit
// is voor nette UI-gating en foutmeldingen.
export async function getStaffContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isStaff: false, role: null as string | null };
  }

  const { data: staffRow } = await supabase
    .from("staff_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, isStaff: !!staffRow, role: staffRow?.role ?? null };
}
