# Sprach-Boss 🗡️

Game RPG belajar kosakata Jerman ↔ Indonesia. Kalahkan bos dengan menjawab vocab dengan benar!

## Fitur
- **Kampanye**: 4 zona (Hotel → Essen → Smalltalk → Behörden), 3 level per zona, unlock progresif
- **Arcade**: 60 detik, skor & streak, simpan best score
- **Fokus kosakata yang belum hafal**: kata yang sering salah muncul lebih sering
- **Local-first**: semua data di browser (localStorage), tanpa backend

## Cara main
Buka `index.html` di browser. Atau jalankan server lokal:
```bash
cd sprach-boss && python3 -m http.server 8080
# buka http://localhost:8080
```

## Struktur
- `index.html` — entry point
- `style.css` — styling dark theme RPG
- `app.js` — game logic (battle, progres, render)
- `vocab.js` — data 80 kosakata (4 tema × 20, tier 1-3)
- `test.js` — unit test (`node test.js`)

## Teknis
- Vanilla HTML/CSS/JS, no build step, no dependencies
- Progres: `localStorage["sprachboss.progress"]`
- Damage: benar = `1 + floor(streak/3)`; musuh HP = `10 + level*5`
- Bobot salah: `wrongWords[]` → vocab muncul 2× lebih sering

## Roadmap (skip dulu, tambah kalau kepake)
- Sound & animasi
- Leaderboard online
- Soal dinamis AI (via 9Router)
