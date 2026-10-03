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

- `src/components/` de onderdelen van de pagina, per gebied (`layout/`, `board/`)
- `src/store/` de zustand-stores; `src/hooks/` gedeelde hooks
- `src/lib/` rekenwerk en opmaak zonder React; `src/types/` de vorm van de gegevens
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
WhatsApp-export ──import──▶ data/scores.csv ──generate──▶ src/data.json ──▶ pagina
                            data/config.json ──┘
```

`data/scores.csv` is de bron: één regel per gedeelde score. Alles op de pagina wordt daaruit
berekend. `src/data.json` is uitvoer en staat niet in git; `dev` en `build` maken hem zelf opnieuw.

### Bijwerken vanuit WhatsApp

Exporteer de groepschat (zonder media) en lees het tekstbestand in:

```bash
npm run import -- "/pad/naar/WhatsApp-chat met Woordle-groep.txt"
```

Nieuwe scores komen onderaan `data/scores.csv`; regels die er al staan blijven ongemoeid, dus
handmatige correcties overleven een volgende import. Daarna wordt `src/data.json` opnieuw gemaakt.
De export zelf hoort niet in dit project.

### Bijwerken met de hand

Voeg een regel toe aan `data/scores.csv`, of pas er een aan, en draai:

```bash
npm run generate
```

## Formaat van `data/scores.csv`

```csv
puzzle,date,player,turns,shared,grid
1592,2025-10-28,Iris,3,2025-10-28T07:55,-Y-Y-/-----/GGGGG
1593,2025-10-29,Jesse,X,2025-10-29T21:02,
```

| kolom    | inhoud                                                                                |
| -------- | ------------------------------------------------------------------------------------- |
| `puzzle` | puzzelnummer van Woordle                                                              |
| `date`   | dag van die puzzel, `JJJJ-MM-DD`; nummer en datum moeten in alle regels samen oplopen |
| `player` | naam van de speler                                                                    |
| `turns`  | `1` tot `6`, of `X` voor niet geraden                                                 |
| `shared` | moment van delen, `JJJJ-MM-DDTUU:MM`; mag leeg                                        |
| `grid`   | de rijen, `G` groen, `Y` geel, `-` mis, gescheiden door `/`; mag leeg                 |

- De volgorde van de regels is de volgorde van delen: wie binnen een puzzel bovenaan staat was eerst.
- Eén regel per speler per puzzel; een dubbele regel is een fout.
- Zonder `shared` telt de regel niet mee voor het tijdstip van delen, zonder `grid` niet voor de opener.

## Instellingen in `data/config.json`

- `title`: kop van de pagina
- `rules.failAs`: aantal beurten waarvoor een X meetelt in het gemiddelde (7)
- `rules.minShare`: deel van de puzzels dat je gespeeld moet hebben voor klassement en prijzenkast (0.1)
- `rules.minPerMonth`: potjes per maand voor een punt in het verloop (5)
- `rules.minOutlier`: spelers per puzzel voor zwaarste en makkelijkste puzzels (4)
- `colors`: vaste kleur per speler; nieuwe namen krijgen vanzelf een reservekleur

## Op mattix.nl

De pagina hoort op `mattix.nl/woordle-scorebord.html` en gaat mee met een deploy van mattix.nl.
Deze repo levert geen eigen site op:
`npm run build` in `../mattix.nl` draait na de eigen build `scripts/install.ts` uit deze repo,
dat de pagina opnieuw bouwt uit `data/scores.csv` en als één bestand in `dist/` van mattix.nl zet.
De pagina heeft `noindex`, zodat zoekmachines hem niet opnemen.
