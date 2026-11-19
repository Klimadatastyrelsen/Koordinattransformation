---
description: Transformér koordinater mellem de koordinatsystemer, der bruges i Danmark og Grønland, i webapplikationen Koordinattransformation.
---

# Brug Koordinattransformation

Koordinattransformation er en webapplikation på koordinattransformation.dk. Den transformerer koordinater mellem de mest udbredte koordinatsystemer i Danmark og Grønland. Selve transformationen sker i tjenesten WEBPROJ.

Læs mere om koordinattransformation på [Klimadatastyrelsens webside](https://www.klimadatastyrelsen.dk/kortlaegning/geodaesi/koordinattransformation).

## Vælg Danmark eller Grønland

Vælg **Danmark** eller **Grønland** i menuen øverst til højre. Danmark er valgt fra start.

| Område   | Baggrundskort        | Koordinatsystemer i listerne              |
| -------- | -------------------- | ----------------------------------------- |
| Danmark  | Skærmkortet (dæmpet) | Systemer for Danmark og globale systemer  |
| Grønland | Åbent Land Grønland  | Systemer for Grønland og globale systemer |

## Vælg koordinatsystemer

1. Under **Input** skal du vælge det koordinatsystem, du vil transformere fra.
2. Under **Output** skal du vælge det koordinatsystem, du vil transformere til.

Listerne viser hvert system med kort navn og kode, fx `ETRS89/UTM32N (EPSG:25832)`.

## Angiv et punkt

Indtast koordinaterne under **Input**, eller klik på kortet. I Danmark kan du også søge efter en adresse eller et stednavn og vælge et resultat.

Markøren på kortet viser punktet. Når alle felter er udfyldt korrekt, vises resultatet automatisk under **Output**.

### Format

Brug punktum som decimaltegn. Hvis et tal har forkert format, markeres feltet. Ved feltet kan du se, hvordan du skal skrive tallet.

Skriv koordinater i meter med højst fire decimaler.

Hvis du bruger et geografisk koordinatsystem, kan du vælge formatet under felterne. Minutter og sekunder kan være nul eller positive tal.

| Format           | Grader            | Minutter          | Sekunder          |
| ---------------- | ----------------- | ----------------- | ----------------- |
| `DD.DD°`         | Højst 9 decimaler |                   |                   |
| `DD° MM.MM'`     | Hele tal          | Højst 6 decimaler |                   |
| `DD° MM' SS.SS"` | Hele tal          | Hele tal          | Højst 4 decimaler |

Hvis koordinatsystemet under **Input** har en højdekomponent, vises også et felt til fx kote eller ellipsoidehøjde. Skriv højden i meter med højst fire decimaler.

## Læs resultatet

Under **Output** står koordinaterne og en eventuel højde på én linje. Klik på kopiikonet ved siden af resultatet.

For et geografisk koordinatsystem vælger du formatet under resultatet på samme måde som under **Input**.

| Format                       | Sådan vises resultatet                                    |
| ---------------------------- | --------------------------------------------------------- |
| Meter                        | Meter med fire decimaler                                  |
| Decimalgrader                | Grader med otte decimaler                                 |
| Grader og minutter           | Hele grader og minutter med seks decimaler                |
| Grader, minutter og sekunder | Hele grader, hele minutter og sekunder med fire decimaler |

> [!NOTE]
> Resultatet viser kun højden, hvis begge koordinatsystemer har en højdekomponent.

## Tilgængelighed

Læs [tilgængelighedserklæringen for Koordinattransformation](https://www.was.digst.dk/koordinattransformation-dk).
