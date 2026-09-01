import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthNav } from "./auth-nav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Excelsior'31 4 - Teamportaal",
  description: "Statistieken, wedstrijden en spelerskaarten van Excelsior'31 4",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                E31
              </span>
              <span className="hidden sm:inline">
                Excelsior&apos;31 <span className="text-accent">4</span>
              </span>
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium text-muted">
              <Link href="/wedstrijden" className="transition hover:text-foreground">
                Wedstrijden
              </Link>
              <Link href="/spelers" className="transition hover:text-foreground">
                Spelers
              </Link>
              <AuthNav email={user?.email ?? null} />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-4 text-center text-xs text-muted">
          Teamportaal Excelsior&apos;31 4 &middot; seizoen {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
