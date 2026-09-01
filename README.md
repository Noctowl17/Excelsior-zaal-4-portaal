# Excelsior'31 4 - Teamportaal

Interactief portaal met aanwezigheid, doelpunten, assists, kaarten, blessures
en spelerskaarten voor het zaalvoetbalteam Excelsior'31 4.

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS, draait als Docker-container op onze eigen Linux server achter Caddy (automatische HTTPS).
- **Data**: Supabase (Postgres + Auth + Storage), managed cloud, project `excelsior31-4-portaal` (regio Frankfurt/eu-central-1). Blijft behouden als de Linux server crasht.
- **Speelschema**: wordt periodiek server-side gesynchroniseerd vanuit de iCal-feed van Sportlink (`scripts/sync-ical.mjs`).

Zie ook het plan-document in het Claude-project "Dashboard zaalvoetbal" voor de volledige achtergrond en fasering.

## Lokaal ontwikkelen

```bash
npm install
cp .env.example .env.local   # vul NEXT_PUBLIC_SUPABASE_ANON_KEY in
npm run dev
```

De site draait dan op http://localhost:3000. De publieke Supabase-URL en
publishable/anon key vind je in het Supabase Dashboard onder
**Project Settings > API**.

## Staf-accounts aanmaken

Log via `/login` in met het e-mailadres van een staflid (magic link, geen
wachtwoord nodig). Dat maakt automatisch een account aan in Supabase Auth,
maar nog niemand mag daarna schrijven totdat er ook een rij in de
`staff_users`-tabel staat. Voeg die toe via de Supabase SQL-editor:

```sql
insert into staff_users (id, full_name, role)
values ('<user-id-uit-auth.users>', 'Voornaam Achternaam', 'admin');
```

De `<user-id>` vind je in Supabase Dashboard onder **Authentication > Users**
nadat iemand voor het eerst heeft ingelogd.

## Speelschema synchroniseren (iCal)

`scripts/sync-ical.mjs` haalt de wedstrijden op uit de Sportlink iCal-link en
zet ze in de `matches`-tabel. Dit script heeft de **service_role** sleutel
nodig (niet de publieke anon-sleutel!), die je apart en geheim uit het
Supabase Dashboard haalt onder **Project Settings > API > service_role
secret** - deel deze nooit en zet 'm nooit in `NEXT_PUBLIC_*`-variabelen.

Eenmalig testen:

```bash
SUPABASE_URL=https://jfbzombcnzpddfxsqysh.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret> \
ICAL_URL="https://data.sportlink.com/ical-team?token=..." \
npm run sync:ical
```

Controleer na de eerste run op de `/wedstrijden`-pagina of "thuis/uit" en de
tegenstander goed herkend zijn; het script raadt dat op basis van de titel
die Sportlink in de wedstrijd zet en dat kan per club net anders zijn
opgemaakt. Pas zo nodig de `guessIsHome`/`guessOpponent`-functies in het
script aan.

Op de Linux server zet je dit als een cron-job, bijvoorbeeld elke ochtend om
06:00:

```cron
0 6 * * * cd /pad/naar/excelsior31-4-portaal && \
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ICAL_URL=... \
  /usr/bin/node scripts/sync-ical.mjs >> /var/log/ical-sync.log 2>&1
```

## Deployen op de Linux server

Vereist: Docker en Docker Compose op de server, en een domein/subdomein dat
naar het IP-adres van de server wijst.

1. Clone de repository op de server:
   ```bash
   git clone git@github.com:<jouw-account>/excelsior31-4-portaal.git
   cd excelsior31-4-portaal
   ```
2. Maak een `.env`-bestand met de publieke Supabase-gegevens:
   ```bash
   cp .env.example .env
   # vul NEXT_PUBLIC_SUPABASE_ANON_KEY in
   ```
3. Pas in `Caddyfile` het domein aan naar je eigen (sub)domein.
4. Start de stack:
   ```bash
   docker compose up -d --build
   ```

Caddy regelt vanzelf een geldig Let's Encrypt-certificaat voor je domein.

Bij een nieuwe versie van de code: `git pull && docker compose up -d --build`.
Omdat alle data in Supabase staat (niet in de container), is dit altijd veilig
- bij een crash of verse installatie van de server hoef je alleen deze
stappen opnieuw te doorlopen en alles staat er weer, inclusief alle
statistieken.

## Volgende stappen

Zie de takenlijst / het plan-document voor de fasering: spelerskaarten met
foto's, seizoensdashboards, en verdere afwerking volgen na deze technische
basis.
