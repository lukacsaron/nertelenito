# NERtelenítő - Chrome Extension

> Tudatos médiafogyasztásért. Segít elkerülni a kormányzati befolyás alatt álló médiát és felismerni a propagandát.

A NERtelenítő egy Chrome bővítmény, amely segít a magyar felhasználóknak navigálni a média világában és ösztönzi a független sajtó fogyasztását.

## ✨ Funkciók

### 🔄 Intelligens Átirányítás
- Automatikusan felismeri a kormányközeli propaganda oldalakat
- Átirányítja a felhasználót független hírforrásokra
- Előzetes értesítés lehetőséggel a visszamondásra
- Testreszabható fehérlista

### 📘 Facebook Hírfolyam Szűrés
- Felismeri a propaganda bejegyzéseket a Facebook hírfolyamban
- Elmossa vagy elrejti a problémás tartalmakat
- Zöld ✓ jellel jelöli meg a független forrásokat
- Teljes felhasználói kontroll

### ⚙️ Testreszabható Beállítások
- Saját oldalak hozzáadása a listákhoz
- Export/import funkció
- Részletes statisztikák
- Átlátható működés

## 🚀 Telepítés

### Fejlesztői Telepítés
1. Klónozd le a repot: `git clone https://github.com/vegevankicsi/nertelenito.git`
2. Telepítsd a függőségeket: `npm install`
3. Építsd le a bővítményt: `npm run build`
4. Nyisd meg a Chrome-ot és navigálj a `chrome://extensions/` oldalra
5. Engedélyezd a "Developer mode"-ot
6. Kattints a "Load unpacked"-ra és válaszd ki a `dist` mappát

### Éles Telepítés
*(Hamarosan elérhető a Chrome Web Store-ban)*

## 🛠️ Fejlesztés

### Előfeltételek
- Node.js 16+
- Chrome böngésző

### Parancsok
```bash
npm run build      # Éles build
npm run dev        # Fejlesztői build watch módban
npm run lint       # TypeScript linting
npm run typecheck  # Type ellenőrzés
npm run format     # Kód formázás
```

### Projekt Struktúra
```
src/
├── background/     # Service worker (átirányítás)
├── content/        # Content scriptek (Facebook szűrés)
├── popup/          # Popup UI
├── options/        # Beállítások oldal
├── common/         # Közös típusok és funkciók
└── manifest.json   # Extension manifest
```

## 🔒 Adatvédelem

A NERtelenítő **teljes mértékben helyi** működésű:
- Nincsenek külső szerver hívások
- Nem gyűjt személyes adatokat
- Nem követi a böngészési szokásokat
- Minden adat a felhasználó gépén marad

## 📝 Licenc

MIT License - lásd [LICENSE](LICENSE) fájl

## 🤝 Közreműködés

Szívesen fogadunk:
- Hibajelentéseket
- Funkciójavaslatokat  
- Pull requesteket
- Visszajelzéseket

## 📞 Kapcsolat

- Email: feedback@hirszuro.hu
- Issues: [GitHub Issues](https://github.com/vegevankicsi/nertelenito/issues)

## 📊 Állapot

- ✅ **MVP Kész**: Alapfunkciók implementálva
- ✅ **Build System**: Webpack + TypeScript
- ✅ **UI/UX**: Modern, magyar nyelvű interface
- 🔄 **Tesztelés**: Folyamatban
- 📋 **Web Store**: Tervezés alatt

## 🎯 Roadmap

- [ ] Chrome Web Store publikálás
- [ ] Firefox támogatás  
- [ ] Fejlett témaalapú átirányítás
- [ ] Felhasználói visszajelzés rendszer
- [ ] Automatikus lista frissítések

---

*Készítve ❤️-tel a tudatos médiafogyasztásért*
