# Woordscore

De site achter woordscore.nl. Ook woordlescore.nl komt daar uit. Scorebord voor een Woordle-groepschat: klassement per jaar en voor altijd, verloop per maand,
prijzenkast, onderlinge duels en uitschieters.

```bash
npm install
npm run serve
```

`npm run serve` bouwt de pagina en start haar met de server erbij op poort 8788, ook bereikbaar
vanaf andere apparaten op hetzelfde netwerk. De scoreborden staan dan lokaal in `.wrangler/`,
los van de echte site.
`npm run dev` start alleen de pagina, zonder server.

## Code

De pagina is een React-app (React 19, state in zustand) in TypeScript:

- `src/components/` de onderdelen van de pagina, per gebied (`board/`, `common/`, `layout/`, `share/`, `start/`, `tips/`, `update/`)
- `src/store/` de zustand-stores; `src/hooks/` gedeelde hooks
- `src/content/` de teksten van de uitleg
- `src/entry-server.tsx` zet de beginpagina bij het bouwen als HTML in `index.html`, zodat zoekmachines en linkvoorvertoningen haar zonder script kunnen lezen
- `src/lib/` rekenwerk en opmaak zonder React; `src/types/` de vorm van de gegevens
- `server/` de Cloudflare Pages Functions, `functions/` wijst er per adres naar
- `scripts/` de scripts voor de command line, in TypeScript die node direct draait

```bash
npm run verify      # prettier, eslint, tsc en knip
npm run lint:fix    # eslint met --fix
npm run format      # prettier, sorteert ook de imports
npm run knip        # ongebruikte bestanden, exports en dependencies
```

`npm install` zet via lefthook de git-hooks klaar: voor een commit draaien prettier, eslint en
tsc op de gewijzigde bestanden, voor een push de hele controle en de tests.

## Hoe het werkt

De beginpagina vraagt om een code. Bestaat er een scorebord onder die code, dan opent het op
een eigen adres: `woordscore.nl/<code>`. Is de code nog vrij, dan kan iemand het scorebord
beginnen met een export van de groepschat. De code is pas bezet als die export minstens twee
scores bevat. Wie de code kent, kan het scorebord bekijken en er met een nieuwere export scores
aan toevoegen.

Elk pad dat geen bestand is levert dezelfde pagina; die leest de code uit het adres. Cloudflare
Pages doet dat vanzelf zolang er geen `404.html` is. Onder `/api/woordle` zit de server.

- De export wordt in de browser uitgelezen (`src/lib/whatsapp.ts`); alleen de scores gaan naar
  de server, de berichten niet. WhatsApp levert een `.zip` met een `.txt` erin, soms een losse `.txt`; beide werken, in
  de gangbare datumnotaties (dag of maand eerst, jaar eerst, 24 uur of AM/PM).
- De pagina rekent alles in de browser uit (`src/lib/stats.ts`).
- De server (`server/woordle.ts`) voegt alleen toe: een bewaarde score wordt nooit gewijzigd of
  verwijderd, en wat binnenkomt moet een geldige score zijn rond de dag van de puzzel.
- Namen komen uit WhatsApp en kunnen per telefoon of in de tijd verschillen. Bij het beginnen
  kiest men per speler de naam op het scorebord. Bij het bijwerken vraagt de pagina bij een
  onbekende naam of het een nieuwe speler is (met een naam naar keuze) of een bestaande onder een
  andere naam. Die keuzes worden bij het scorebord bewaard en gelden voor volgende exports.
- Het scorebord krijgt als naam de groep uit de bestandsnaam van de eerste export, anders de
  code. Die naam is bij het beginnen en daarna aan te passen.
- De code is het enige slot. Wie haar kent, kan ook de naam wijzigen en het scorebord
  verwijderen; voor verwijderen moet de code worden overgetypt.

Voor een gedeelde link vult `server/page.ts` de naam van het scorebord in de titel en omschrijving
van de pagina in, zodat WhatsApp die in de voorvertoning toont. Het plaatje daarbij is
`public/og.png`; `npm run og` maakt het opnieuw uit `brand/og.html`. `/voorbeeld` is een
scorebord met verzonnen spelers dat in de browser wordt gemaakt (`src/lib/demo.ts`).

De server is een Cloudflare Pages Function met een KV-namespace, binding `WOORDLE`. Per
scorebord: `group:<code>` (naam, datum, gekoppelde namen), `scores:<code>` (de scores) en
`prev:<code>` (de scores voor de laatste wijziging).

## Vindbaarheid

Alleen de beginpagina van woordscore.nl mag in zoekmachines komen. Scoreborden niet, en hun
scores ook niet. Dat staat op drie plekken: `public/robots.txt` (voor wie vraagt voor hij leest),
de `robots`-tag in de pagina en de kop `X-Robots-Tag` (beide gezet door `server/page.ts`, en voor
de scores door `server/woordle.ts`). Dit is een verzoek: een crawler die zich er niet aan houdt,
wordt er niet door tegengehouden.

## Iconen

De iconen komen uit [Lucide](https://lucide.dev) (ISC-licentie), via het pakket `lucide-react`.
Welke er gebruikt worden staat in `src/components/common/Icon.tsx`. Er staan geen emoji's op de pagina.

## Testen

```bash
npm test
```

De tests leggen vast wat de site moet doen. Ze draaien met vitest, zonder browser of netwerk.

| bestand                    | wat het vastlegt                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `test/scores.test.ts`      | het standaardformaat: wat een geldige regel is, en dat toevoegen nooit iets wijzigt         |
| `test/whatsapp.test.ts`    | scores uit een export halen, in elke gangbare datum- en tijdnotatie; wat wordt overgeslagen |
| `test/export-file.test.ts` | een `.txt` lezen, en de `.txt` uit een `.zip`                                               |
| `test/stats.test.ts`       | elk cijfer op het scorebord, tegen een kleine set scores die met de hand is uitgerekend     |
| `test/server.test.ts`      | de server: codes, een scorebord beginnen, alleen toevoegen, gekoppelde namen, verwijderen   |
| `test/page.test.ts`        | de linkvoorvertoning: naam van het scorebord in titel en omschrijving                       |
| `test/www.test.ts`         | `www.woordscore.nl` en `woordlescore.nl` sturen door naar `woordscore.nl`                   |
| `test/robots.test.ts`      | `robots.txt` houdt scoreborden dicht, ook onder de regels die Cloudflare erboven zet        |
| `test/demo.test.ts`        | het voorbeeldscorebord: geldige scores die elk onderdeel vullen                             |

Verandert een telregel met opzet, pas dan de test en de uitleg in `src/content/tips.tsx` tegelijk aan. De
pagina zelf (`src/App.tsx`) heeft geen tests; die is in de browser nagelopen.

## Voorbeeldscores in deze repo

`data/scores.csv` is een verzonnen voorbeeld in het standaardformaat, bij te werken vanuit een bestand:

```bash
npm run import -- "/pad/naar/WhatsApp-chat met Woordle-groep.txt"
```

`npm run check` zegt of het bestand klopt.

## Formaat van `data/scores.csv`

```csv
puzzle,date,player,turns,shared,grid
1592,2025-10-28,Iris,3,2025-10-28T07:55,-Y-Y-/-----/GGGGG
1593,2025-10-29,Jesse,X,2025-10-29T21:02,
```

| kolom    | inhoud                                                                          |
| -------- | ------------------------------------------------------------------------------- |
| `puzzle` | puzzelnummer van Woordle                                                        |
| `date`   | dag van die puzzel, `JJJJ-MM-DD`; moet kloppen met het puzzelnummer             |
| `player` | naam van de speler: letters, cijfers, spaties, streepjes, punten en apostroffen |
| `turns`  | `1` tot `6`, of `X` voor niet geraden                                           |
| `shared` | moment van delen, `JJJJ-MM-DDTUU:MM`; mag leeg                                  |
| `grid`   | de rijen, `G` groen, `Y` geel, `-` mis, gescheiden door `/`; mag leeg           |

- Wie binnen een puzzel als eerste deelde, volgt uit `shared`. Bij hetzelfde tijdstip, of zonder `shared`, telt de volgorde van de regels.
- Eén regel per speler per puzzel; een dubbele regel is een fout.
- Zonder `shared` telt de regel niet mee voor het tijdstip van delen, zonder `grid` niet voor de opener.
- Staat er een `grid`, dan moet het aantal rijen kloppen met `turns` en alleen de laatste rij van een geraden woord helemaal groen zijn.

## Instellingen in `data/config.json`

- `api`: adres van de server met de scoreborden
- `rules.failAs`: aantal beurten waarvoor een X meetelt in het gemiddelde (7)
- `rules.minShare`: deel van de puzzels dat je gespeeld moet hebben voor klassement en prijzenkast (0.1)
- `rules.minPerMonth`: potjes per maand voor een punt in het verloop (5)
- `rules.minOutlier`: spelers per puzzel voor zwaarste en makkelijkste puzzels (4)
- `rules.minPerWeekday`: potjes op een weekdag voor iemands beste en zwaarste weekdag (5)
- `rules.minBestMonth`: potjes in een maand om als beste maand te tellen (10)
- `rules.formDays`: aantal laatste puzzels waarover de vorm wordt berekend (30)
- `rules.minForm`: potjes in die dagen om een vorm te krijgen (10)

## Live zetten

```bash
npm run deploy
```

Dat draait de tests, bouwt de pagina en zet haar met de server op het Cloudflare Pages-project
`woordscore` (zie `wrangler.toml`). De scoreborden staan in de KV-namespace `WOORDSCORE`, in de
code bereikbaar als `WOORDLE`.

## Licentie

MIT, zie [`LICENSE`](LICENSE).
