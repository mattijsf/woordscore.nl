# Woordscore

De site achter woordlescore.nl en woordscore.nl. Scorebord voor een Woordle-groepschat: klassement per jaar en voor altijd, verloop per maand,
prijzenkast, onderlinge duels en uitschieters.

```bash
npm install
npm run serve
```

`npm run serve` bouwt de pagina en start haar met de server erbij op poort 8788, ook bereikbaar
vanaf andere apparaten op hetzelfde netwerk. De scoreborden staan dan lokaal in `.wrangler/`.
`npm run dev` start alleen de pagina, zonder server.

## Code

De pagina is een React-app (React 19, state in zustand) in TypeScript:

- `src/components/` de onderdelen van de pagina, per gebied (`board/`, `layout/`, `share/`, `start/`, `tips/`, `update/`)
- `src/store/` de zustand-stores; `src/hooks/` gedeelde hooks
- `src/content/` de teksten van de uitleg
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

De beginpagina vraagt om een code. Bestaat er een scorebord onder die code, dan opent het
(`?g=<code>`). Is de code nog vrij, dan kan iemand het scorebord beginnen met een export van de
groepschat. De code is pas bezet als die export minstens twee scores bevat. Wie de code kent, kan
het scorebord bekijken en er met een nieuwere export scores aan toevoegen. `defaultGroup` in
`data/config.json` slaat de beginpagina over en opent een vast scorebord.

- De export wordt in de browser uitgelezen (`src/lib/whatsapp.ts`); alleen de scores gaan naar
  de server, de berichten niet. WhatsApp levert een `.zip` met een `.txt` erin, soms een losse `.txt`; beide werken, in
  de gangbare datumnotaties (dag of maand eerst, jaar eerst, 24 uur of AM/PM).
- De pagina rekent alles in de browser uit (`src/lib/stats.ts`).
- De server (`server/woordle.ts`) voegt alleen toe: een bewaarde score wordt nooit gewijzigd of
  verwijderd, en wat binnenkomt moet een geldige score zijn rond de dag van de puzzel.
- Namen komen uit WhatsApp en kunnen per telefoon of in de tijd verschillen. Bij het bijwerken
  vraagt de pagina bij een onbekende naam of het een nieuwe speler is of een bestaande onder een
  andere naam. Zo'n koppeling wordt bij het scorebord bewaard en geldt voor volgende exports.
- Wie een scorebord begint, krijgt een beheercode. Alleen daarmee kan het worden verwijderd.

De server is een Cloudflare Pages Function met een KV-namespace, binding `WOORDLE`. Per
scorebord: `group:<code>` (naam, datum, hash van de beheercode, gekoppelde namen), `scores:<code>` (de scores) en
`prev:<code>` (de scores voor de laatste wijziging).

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

| kolom    | inhoud                                                                |
| -------- | --------------------------------------------------------------------- |
| `puzzle` | puzzelnummer van Woordle                                              |
| `date`   | dag van die puzzel, `JJJJ-MM-DD`; moet kloppen met het puzzelnummer   |
| `player` | voornaam van de speler, alleen letters                                |
| `turns`  | `1` tot `6`, of `X` voor niet geraden                                 |
| `shared` | moment van delen, `JJJJ-MM-DDTUU:MM`; mag leeg                        |
| `grid`   | de rijen, `G` groen, `Y` geel, `-` mis, gescheiden door `/`; mag leeg |

- Wie binnen een puzzel als eerste deelde, volgt uit `shared`. Bij hetzelfde tijdstip, of zonder `shared`, telt de volgorde van de regels.
- Eén regel per speler per puzzel; een dubbele regel is een fout.
- Zonder `shared` telt de regel niet mee voor het tijdstip van delen, zonder `grid` niet voor de opener.
- Staat er een `grid`, dan moet het aantal rijen kloppen met `turns` en alleen de laatste rij van een geraden woord helemaal groen zijn.

## Instellingen in `data/config.json`

- `api`: adres van de server met de scoreborden
- `defaultGroup`: code van het scorebord dat de pagina toont als er geen code in de link staat; leeg toont het beginscherm
- `rules.failAs`: aantal beurten waarvoor een X meetelt in het gemiddelde (7)
- `rules.minShare`: deel van de puzzels dat je gespeeld moet hebben voor klassement en prijzenkast (0.1)
- `rules.minPerMonth`: potjes per maand voor een punt in het verloop (5)
- `rules.minOutlier`: spelers per puzzel voor zwaarste en makkelijkste puzzels (4)
- `rules.minPerWeekday`: potjes op een weekdag voor iemands beste en zwaarste weekdag (5)
- `rules.minBestMonth`: potjes in een maand om als beste maand te tellen (10)

## Op mattix.nl

De pagina hoort op `mattix.nl/woordle-scorebord.html` en gaat mee met een deploy van mattix.nl.
Deze repo levert geen eigen site op:
`npm run build` in `../mattix.nl` draait na de eigen build `scripts/install.ts` uit deze repo,
dat de pagina opnieuw bouwt uit `data/scores.csv` en als één bestand in `dist/` van mattix.nl zet.
Hetzelfde script zet `functions/api/woordle/[[path]].js` in mattix.nl neer, dat naar `server/woordle.ts` hier
verwijst. Die server bewaart de scores in de KV-namespace met binding `WOORDLE` (zie `wrangler.toml`
van mattix.nl).
De pagina heeft `noindex`, zodat zoekmachines hem niet opnemen.
