# NERtelenítő

Chrome-bővítmény, amely átirányít a kormányközeli hírportálokról független forrásokra, és megjelöli a propagandaposztokat a Facebook-hírfolyamban.

> *A Chrome extension for Hungarian readers: it redirects away from state-aligned news sites to independent outlets, and flags propaganda posts in the Facebook feed. Everything runs locally, nothing is collected.*

## Miért

A magyar médiapiac nagyobbik fele kormányzati befolyás alatt áll, és ez a hírfolyamban nem látszik. Egy megosztott cikknél nem derül ki, hogy ki a tulajdonos és mi a szerkesztőségi érdek. Aki nem követi napi szinten a tulajdonosi köröket, annak ez láthatatlan.

A NERtelenítő nem cenzúráz. Kontextust ad, és felajánl egy alternatívát. Minden lépés megkerülhető, a listák szerkeszthetők, és a bővítmény elmondja, miért csinálja, amit csinál.

## Mit csinál

### Átirányítás

Ha kormányközeli portálra navigálsz, előbb kapsz egy 2-3 másodperces overlayt, csak utána történik meg az átirányítás:

> **Pillanat! Egy lépéssel a tudatos médiafogyasztás felé.**
> Az általad keresett oldal gyakran egyoldalú tájékoztatást nyújt. Átirányítunk egy független forrásra.
> `[Oké, irány a független hír!]` `[Maradok az eredeti oldalon]`

Az overlay a lényeg. Egy azonnali átugrás manipuláció lenne, egy magyarázattal együtt felkínált választás nem az. Kikapcsolható munkamenetre, oldalra vagy globálisan.

A 13 alapértelmezett forrás (Origo, 888, Ripost, Pesti Srácok, Vadhajtások, Magyar Nemzet, Híradó és társaik) helyett tíz független oldal közül választ véletlenszerűen: Telex, 444, HVG, Népszava, Mérce, Átlátszó, Direkt36, Szabad Európa és mások.

### Facebook-szűrés

A hírfolyamban a content script felismeri a listás forrásokból származó posztokat, és elmossa vagy elrejti őket, a beállítás szerint. A független forrásokat zöld pipával jelöli. A blacklist kormányzati politikusok és kommunikátorok oldalait tartalmazza, mindegyiknél egy `reason` mezővel, ami megmondja, miért került a listára.

### Beállítások

Saját oldalak hozzáadása mindkét listához, export és import, statisztika arról, hányszor lépett működésbe.

## Adatvédelem

Nincs szerverhívás, nincs analitika, nincs adatgyűjtés. A listák és a beállítások a `chrome.storage.local`-ban maradnak, a gépeden. A bővítmény `host_permissions` értéke pontosan a listás domainekre és a facebook.com-ra szól, semmi másra.

## Telepítés

Nincs fent a Chrome Web Store-ban. Fejlesztői módban:

```bash
npm install
npm run build
```

Ezután `chrome://extensions/` → Fejlesztői mód bekapcsol → „Kicsomagolt bővítmény betöltése" → válaszd a `dist` mappát.

## Fejlesztés

```bash
npm run dev        # webpack watch módban
npm run typecheck  # tsc --noEmit
npm run lint
npm run format
```

## Felépítés

```
src/
  background/        service worker, declarativeNetRequest szabályok
  content/           Facebook content script + stílusok
  popup/             gyors kapcsolók
  options/           listakezelés, export/import, statisztika
  common/
    defaultLists.ts  a három alapértelmezett lista
    storage.ts       chrome.storage wrapper
  redirect-overlay.*  az átirányítás előtti overlay
  manifest.json      Manifest V3
```

TypeScript, webpack, nulla futásidejű függőség.

A `NERtelenito.md` tartalmazza az eredeti specifikációt, beleértve a hangnemre és a copyra vonatkozó döntéseket. A `TESTING.md` a kézi tesztforgatókönyveket.

## Állapot

MVP. Az átirányítás és a Facebook-szűrés működik, a Web Store-os publikálás nem történt meg. A listák 2025 novemberi állapotot tükröznek, és kézi karbantartást igényelnek.

## Listákról

A listák szerkesztői döntések, nem mérések. A tulajdonosi és szerkesztőségi viszonyok változnak, és egy hardcode-olt lista elavul. Ezért szerkeszthető mindegyik a beállításokban, és ezért látszik minden bejegyzésnél, hogy miért került oda. Ha nem értesz egyet egy besorolással, vedd ki.

## Licenc

MIT.
