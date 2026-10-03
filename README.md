# Woordle-scorebord

Scorebord voor de Woordle-groepschat: klassement per jaar en voor altijd, verloop per maand,
prijzenkast, onderlinge duels en uitschieters.

```bash
npm install
npm run dev
```

`npm run build` zet de statische pagina in `dist/`.

## Code

De pagina is een React-app (React 19, state in zustand) in TypeScript:

- `src/components/` de onderdelen van de pagina, per gebied (`board/`, `layout/`, `tips/`, `update/`)
- `src/store/` de zustand-stores; `src/hooks/` gedeelde hooks
- `src/content/` de teksten van de uitleg
- `src/lib/` rekenwerk en opmaak zonder React; `src/types/` de vorm van de gegevens
- `server/` de Cloudflare Pages Function
- `scripts/` de scripts voor de command line, in TypeScript die node direct draait

```bash
npm run verify      # prettier, eslint, tsc en knip
npm run lint:fix    # eslint met --fix
npm run format      # prettier, sorteert ook de imports
npm run knip        # ongebruikte bestanden, exports en dependencies
```

`npm install` zet via lefthook de git-hooks klaar: voor een commit draaien prettier, eslint en
tsc op de gewijzigde bestanden, voor een push de hele controle.

## Hoe de cijfers op de pagina komen

```
WhatsApp-export ─┬─ npm run import ──▶ data/scores.csv ──▶ ingebouwd in de pagina
                 └─ uploaden op de pagina ──▶ server (/api/woordle) ──▶ elke bezoeker
```

`data/scores.csv` is de bron: één regel per gedeelde score. De pagina rekent alles daaruit uit,
in de browser (`src/lib/stats.ts`). Bij het openen haalt ze er de scores bij die sindsdien op de
site zijn geüpload.

### Bijwerken op de pagina

Onderaan de pagina staat "Export kiezen". De export wordt in de browser uitgelezen
(`src/lib/whatsapp.ts`); alleen de scores gaan naar de server, de berichten niet. Android levert
een `.txt`, iPhone een `.zip`; beide werken.

Iedereen met de link kan dit doen. De server (`server/woordle.ts`) voegt daarom alleen toe: een
bewaarde score wordt nooit gewijzigd of verwijderd, en wat binnenkomt moet een geldige score zijn
rond de dag van de puzzel. De vorige versie blijft bewaard onder de sleutel `scores:prev`.

### De repo bijhouden

```bash
npm run pull
```

haalt de scores van de site naar `data/scores.csv`. Kijk met `git diff` wat erbij kwam voor je
commit. Wil je de site terugzetten naar wat in de repo staat:

```bash
cd ../mattix.nl && npx wrangler kv key put scores --binding WOORDLE --remote --path ../woordle-scorebord/data/scores.csv
```

### Bijwerken vanuit een bestand

```bash
npm run import -- "/pad/naar/WhatsApp-chat met Woordle-groep.txt"
```

Nieuwe scores komen onderaan `data/scores.csv`; regels die er al staan blijven ongemoeid, dus
handmatige correcties overleven een volgende import. De export zelf hoort niet in dit project.

### Bijwerken met de hand

Voeg een regel toe aan `data/scores.csv`, of pas er een aan. `npm run check` zegt of het bestand
klopt; `dev` en `build` draaien die controle vanzelf.

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

- De volgorde van de regels is de volgorde van delen: wie binnen een puzzel bovenaan staat was eerst.
- Eén regel per speler per puzzel; een dubbele regel is een fout.
- Zonder `shared` telt de regel niet mee voor het tijdstip van delen, zonder `grid` niet voor de opener.
- Staat er een `grid`, dan moet het aantal rijen kloppen met `turns` en alleen de laatste rij van een geraden woord helemaal groen zijn.

## Instellingen in `data/config.json`

- `title`: kop van de pagina
- `api`: adres van de server met de gedeelde scores; weglaten maakt de pagina los van elke server
- `rules.failAs`: aantal beurten waarvoor een X meetelt in het gemiddelde (7)
- `rules.minShare`: deel van de puzzels dat je gespeeld moet hebben voor klassement en prijzenkast (0.1)
- `rules.minPerMonth`: potjes per maand voor een punt in het verloop (5)
- `rules.minOutlier`: spelers per puzzel voor zwaarste en makkelijkste puzzels (4)
- `rules.minPerWeekday`: potjes op een weekdag voor iemands beste en zwaarste weekdag (5)
- `rules.minBestMonth`: potjes in een maand om als beste maand te tellen (10)
- `colors`: vaste kleur per speler; nieuwe namen krijgen vanzelf een reservekleur

## Op mattix.nl

De pagina hoort op `mattix.nl/woordle-scorebord.html` en gaat mee met een deploy van mattix.nl.
Deze repo levert geen eigen site op:
`npm run build` in `../mattix.nl` draait na de eigen build `scripts/install.ts` uit deze repo,
dat de pagina opnieuw bouwt uit `data/scores.csv` en als één bestand in `dist/` van mattix.nl zet.
Hetzelfde script zet `functions/api/woordle.js` in mattix.nl neer, dat naar `server/woordle.ts` hier
verwijst. Die server bewaart de scores in de KV-namespace met binding `WOORDLE` (zie `wrangler.toml`
van mattix.nl).
De pagina heeft `noindex`, zodat zoekmachines hem niet opnemen.
