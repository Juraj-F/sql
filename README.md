# SQL Practice Dashboard

Lokálny nástroj na precvičovanie SQL – vlastný dashboard, kde si píšeš a spúšťaš
`SELECT` dotazy nad realistickou (ale syntetickou) databázou a hneď vidíš výsledky
v tabuľke. Bez frameworkov, bez `npm install` – celý beží len na vstavaných
Node.js moduloch (`http` + `node:sqlite`).

## Požiadavky

- **Node.js 22.5 alebo novší** (kvôli vstavanému `node:sqlite` modulu).
  Over si verziu: `node -v`

Žiadne ďalšie závislosti, žiadny build krok.

## Spustenie

```bash
# 1. rozbaľ archív a presuň sa do priečinka
cd sql-dashboard

# 2. databáza data.db je už pribalená a naplnená dátami.
#    Ak by si ju chcel/a znova vygenerovať (napr. iný objem dát), spusti:
node seed.js

# 3. spusti server
node server.js
```

Otvor v prehliadači: **http://localhost:3000**

## Čo v tom nájdeš

Databáza (`data.db`, SQLite) obsahuje 8 prepojených tabuliek s tisíckami
riadkov dát, tematicky blízkych IT projektovému koordinátorovi v priemyselnej
automatizácii aj bežnej biznis agende (zákazníci/objednávky):

| Tabuľka        | Popis                                                          |
|----------------|-----------------------------------------------------------------|
| `departments`  | Oddelenia firmy                                                 |
| `employees`    | Zamestnanci (projektoví manažéri, konštruktéri, elektrikári...) |
| `suppliers`    | Dodávatelia komponentov                                        |
| `projects`     | Projekty (klient, rozpočet, stav, manažér)                      |
| `components`   | Komponenty projektov (materiál, kritickosť, stav, dodávateľ)    |
| `customers`    | Zákazníci                                                       |
| `orders`       | Objednávky zákazníkov                                           |
| `order_items`  | Položky jednotlivých objednávok                                 |

## Ako to používať

1. V ľavom paneli klikni na tabuľku v **Schema databázy** – rozbalí sa
   zoznam stĺpcov, aby si vedel/a, s čím pracuješ.
2. V **Vzorové queries** je 12 pripravených príkladov od najjednoduchších
   (`WHERE`) až po pokročilé (`JOIN`, `GROUP BY` + `HAVING`, korelované
   subquery, `ROW_NUMBER() OVER (...)`, `CASE WHEN`). Klikni na niektorý a
   načíta sa do editora.
3. Uprav dotaz alebo napíš vlastný a spusti ho tlačidlom **▶ Spustiť**
   (alebo `Ctrl/Cmd + Enter`).
4. Výsledky sa zobrazia v tabuľke dole, spolu s počtom riadkov a časom
   vykonania.

### Bezpečnosť

Server zámerne povoľuje **iba `SELECT`** dotazy (aj `WITH ... SELECT`).
Databáza sa navyše otvára v `readOnly` režime, takže aj keby si napísal/a
`DELETE`/`DROP`/`UPDATE`, nič sa reálne nezmení – dostaneš len chybovú hlášku.
Vďaka tomu môžeš skúšať čokoľvek bez rizika, že si dáta pokazíš.

## Prečo zrovna táto téma dát

Schéma zámerne kopíruje typ otázok, ktoré padajú na pohovoroch pre pozíciu
IT projektového koordinátora (napr. presne otázka *"zákazníci bez objednávky
za posledný rok"* je pripravená ako vzorový príklad č. 3), a zároveň
odzrkadľuje svet priemyselnej automatizácie (kritickosť komponentov,
zváraný/skrutkovaný typ, stav vo výrobe/plánovaní) – teda oblasť, z ktorej
prichádzaš.

## Rozšírenie

- Chceš viac dát? Uprav konštanty v `seed.js` (napr. `CUST_COUNT`,
  `ORDER_COUNT`, `PROJ_COUNT`) a spusti `node seed.js` znova.
- Chceš pridať vlastné vzorové queries? Uprav pole `EXAMPLE_QUERIES`
  v `server.js`.
