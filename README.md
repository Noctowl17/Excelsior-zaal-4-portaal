# Excelsior'31 4 - Teamportaal

Interactief portaal met aanwezigheid, doelpunten, assists, kaarten, blessures
en spelerskaarten voor het zaalvoetbalteam Excelsior'31 4.

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS, draait als Docker-app op TrueNAS SCALE, achter je eigen nginx reverse proxy (die het domein en HTTPS regelt).
- **Data**: Supabase (Postgres + Auth + Storage), managed cloud, project `excelsior31-4-portaal` (regio Frankfurt/eu-central-1). Blijft behouden als de NAS uitvalt.
- **Speelschema**: wordt periodiek server-side gesynchroniseerd vanuit de iCal-feed van Sportlink (`scripts/sync-ical.mjs`).
- **Image-builds**: GitHub Actions bouwt bij elke push naar `main` automatisch een Docker-image en publiceert die naar GitHub Container Registry (ghcr.io) - er wordt dus nooit op de NAS zelf gebouwd.

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

`/login` werkt met e-mailadres + wachtwoord (geen magic link meer - die liep
al snel tegen de standaard e-mail-rate-limit van Supabase aan). Nieuwe
staf-accounts maak je daarom rechtstreeks aan in het Supabase Dashboard, niet
via de website:

1. Ga naar **Authentication > Users > Add user > Create new user**.
2. Vul het e-mailadres en een (tijdelijk) wachtwoord in, en vink **Auto
   Confirm User** aan (anders moet het account eerst een bevestigingsmail
   accepteren, wat weer tegen dezelfde rate-limit aanloopt).
3. Voeg daarna een rij toe aan de `staff_users`-tabel via de Supabase
   SQL-editor, zodat het account ook echt mag schrijven:

```sql
insert into staff_users (id, full_name, role)
values ('<user-id-uit-auth.users>', 'Voornaam Achternaam', 'admin');
```

De `<user-id>` vind je in dezelfde **Authentication > Users**-lijst, bij de
zojuist aangemaakte gebruiker.

**Wachtwoord kwijt of wijzigen?** Ga naar **Authentication > Users**, open de
gebruiker en zet daar een nieuw wachtwoord. Er is bewust geen
zelfservice-"wachtwoord vergeten"-link, omdat die ook weer op de e-mail
rate-limit zou stuiten - voor dit team-formaat is handmatig resetten door een
beheerder simpeler en betrouwbaarder.

## Speelschema synchroniseren (iCal)

`scripts/sync-ical.mjs` haalt de wedstrijden op uit de Sportlink iCal-link en
zet ze in de `matches`-tabel. Dit script heeft de **service_role** sleutel
nodig (niet de publieke anon-sleutel!), die je apart en geheim uit het
Supabase Dashboard haalt onder **Project Settings > API > service_role
secret** - deel deze nooit en zet 'm nooit in `NEXT_PUBLIC_*`-variabelen.

Eenmalig testen (lokaal, met Node en de dependencies geïnstalleerd):

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

**Op TrueNAS** hoef je hier niets voor te installeren: dezelfde Docker-image
die de website draait, bevat ook dit script. Zet onder **System Settings >
Advanced Settings > Cron Jobs** een taak die als root draait, bijvoorbeeld
elke ochtend om 06:00 (`0 6 * * *`), met als commando. **Belangrijk:** plak dit
als **één regel** in het commando-veld - het TrueNAS-tekstveld behandelt
regeleindes anders dan een terminal, waardoor de `\`-regelvervolgtekens uit
een multi-line commando corrupt raken en Docker afbreekt met exit-code 125
(EFAULT):

```bash
docker run --rm -e SUPABASE_URL=https://jfbzombcnzpddfxsqysh.supabase.co -e SUPABASE_SERVICE_ROLE_KEY=<service-role-secret> -e ICAL_URL="https://data.sportlink.com/ical-team?token=..." ghcr.io/noctowl17/excelsior-zaal-4-portaal:latest node scripts/sync-ical.mjs
```

(De multi-line versie met `\` hieronder is enkel handig om lokaal in een
terminal te testen, zie de volgende sectie - gebruik die niet in het
TrueNAS-cronveld.)

## Deployen op TrueNAS SCALE

### 1. Eenmalig: GitHub Actions instellen

Zet in de GitHub-repository onder **Settings > Secrets and variables >
Actions > Variables** twee "Repository variables" aan (geen secrets, dit
zijn publieke waarden die toch in de browser zichtbaar zijn):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(dezelfde publishable key als in je lokale `.env.local`). Vanaf de eerste
push naar `main` bouwt en publiceert de workflow in
`.github/workflows/docker-publish.yml` automatisch
`ghcr.io/noctowl17/excelsior-zaal-4-portaal:latest`.

Zet de zichtbaarheid van die package op **public** (GitHub > je profiel >
Packages > excelsior-zaal-4-portaal > Package settings), zodat TrueNAS 'm
zonder inloggegevens kan pullen. Wil je 'm liever privé houden: doe dan
eenmalig `docker login ghcr.io` op de NAS met een token dat `read:packages`
mag.

### 2. Op TrueNAS: de app installeren

Ga naar **Apps > Discover Apps > Install via YAML** en plak:

```yaml
services:
  app:
    image: ghcr.io/noctowl17/excelsior-zaal-4-portaal:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
```

(Poort 3000 mag je links aanpassen als die al in gebruik is op je NAS - pas
dan ook stap 3 aan.)

### 3. Je bestaande nginx reverse proxy koppelen

Voeg een nieuw proxy-host toe dat naar `<ip-van-je-truenas>:3000` wijst, met
het (sub)domein en SSL-certificaat zoals je dat al voor je andere
zelf-gehoste apps doet.

### 4. Updaten na nieuwe code

Push je wijziging naar GitHub - de Action bouwt en publiceert automatisch een
nieuwe `:latest`. Open daarna in TrueNAS de app en kies **Update/Redeploy**
(of stop 'm en start 'm opnieuw) zodat hij de nieuwe image pullt.

Omdat alle statistieken in Supabase staan en niet in de container of op de
NAS zelf, is dit altijd veilig - bij een verse installatie hoef je alleen
deze stappen opnieuw te doorlopen en alles staat er weer.

## Volgende stappen

Zie de takenlijst / het plan-document voor de fasering: spelerskaarten met
foto's, seizoensdashboards, en verdere afwerking volgen na deze technische
basis.
