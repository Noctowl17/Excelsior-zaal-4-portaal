import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excelsior'31 4 - Teamportaal",
  description: "Statistieken, wedstrijden en spelerskaarten van Excelsior'31 4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              Excelsior&apos;31 4
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/wedstrijden">Wedstrijden</Link>
              <Link href="/spelers">Spelers</Link>
              <Link href="/login">Staf login</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t bg-white py-4 text-center text-xs text-neutral-500">
          Teamportaal Excelsior&apos;31 4 &middot; seizoen {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
