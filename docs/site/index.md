---
description: Transformér koordinater mellem de koordinatsystemer, der bruges i Danmark og Grønland, i webapplikationen Koordinattransformation.
---

# Brug Koordinattransformation

Koordinattransformation er en webapplikation på koordinattransformation.dk. Den transformerer koordinater mellem de mest udbredte koordinatsystemer i Danmark og Grønland. Selve transformationen sker i tjenesten WEBPROJ.

Læs mere om koordinattransformation på [Klimadatastyrelsens webside](https://www.klimadatastyrelsen.dk/kortlaegning/geodaesi/koordinattransformation).

## Vælg Danmark eller Grønland

Vælg **Danmark** eller **Grønland** i menuen øverst til højre. Siden åbner med Danmark.

| Område   | Baggrundskort        | Koordinatsystemer i listerne              |
| -------- | -------------------- | ----------------------------------------- |
| Danmark  | Skærmkortet (dæmpet) | Systemer for Danmark og globale systemer  |
| Grønland | Åbent Land Grønland  | Systemer for Grønland og globale systemer |

## Vælg koordinatsystemer

1. Under **Input** vælger du det koordinatsystem, som din koordinat er i.
2. Under **Output** vælger du det koordinatsystem, som du vil have koordinaten i.

Listerne viser hvert system med kort navn og EPSG-kode, fx `ETRS89/UTM32N (EPSG:25832)`.

## Angiv en koordinat

Du kan angive koordinaten på tre måder:

- Skriv koordinaten i felterne under **Input**.
- Klik på kortet. Siden sætter en markør og bruger punktet som input.
- Søg efter en adresse eller et stednavn i feltet **Søg koordinat via adresse eller stednavn**, og vælg et resultat. Søgningen findes kun for Danmark.

Der er ingen knap til at transformere. Siden transformerer koordinaten kort tid efter, at du er holdt op med at skrive. Markøren på kortet flytter sig til koordinaten.

### Format

Brug punktum som decimaltegn. Siden transformerer kun, når alle felter har det rigtige format. Et felt med forkert format bliver markeret, og siden viser, hvilket format feltet skal have.

Koordinater i meter skriver du som tal med 0-4 decimaler.

For et geografisk koordinatsystem vælger du formatet under felterne:

| Format           | Grader                | Minutter                       | Sekunder                       |
| ---------------- | --------------------- | ------------------------------ | ------------------------------ |
| `DD.DD°`         | Tal med 0-9 decimaler |                                |                                |
| `DD° MM.MM'`     | Tal uden decimaler    | Positivt tal med 0-6 decimaler |                                |
| `DD° MM' SS.SS"` | Tal uden decimaler    | Positivt tal uden decimaler    | Positivt tal med 0-4 decimaler |

Hvis input-systemet har en højde, fx kote eller ellipsoidehøjde, er der også et felt til højden. Skriv højden i meter som et tal med 0-4 decimaler.

## Læs resultatet

Resultatet står under **Output** som én linje, fx to koordinater og en højde i meter. Klik på kopiér-knappen ved siden af for at kopiere resultatet.

For et geografisk koordinatsystem vælger du formatet under resultatet på samme måde som under **Input**.

Resultatet har dette antal decimaler:

| Koordinater                  | Decimaler |
| ---------------------------- | --------- |
| Meter                        | 4         |
| Grader                       | 8         |
| Grader og minutter           | 0 og 6    |
| Grader, minutter og sekunder | 0, 0 og 4 |

> [!NOTE]
> Resultatet har kun en højde, når både input-systemet og output-systemet har en højde. Når et af systemerne er todimensionalt, giver en højde ikke mening og vil være misvisende.

## Tilgængelighed

Læs [tilgængelighedserklæringen for Koordinattransformation](https://www.was.digst.dk/koordinattransformation-dk).
