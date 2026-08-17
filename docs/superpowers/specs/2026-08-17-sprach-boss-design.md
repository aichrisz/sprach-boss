# Sprach-Boss — Design Doc

Tanggal: 2026-08-17
Status: Approved (Abel)
Stack: vanilla HTML/CSS/JS, local-first, no build step

## Ringkasan
Game RPG belajar vocab Jerman↔Indonesia. Hybrid: mode Campaign (serius, linear, unlock) + mode Arcade (santai, 60 detik, streak & combo). Fokus: kosakata yang belum hafal — `wrongWords` diberi bobot lebih tinggi.

## Arsitektur
- `index.html` + `style.css` + `app.js` + `vocab.js` + `test.js` + `README.md`
- Data: `VOCAB[]` — `{de, id, tema, tier}`, 80 entry, 4 tema (hotel/essen/smalltalk/behoerden), 20 per tema (10 tier-1, 6 tier-2, 4 tier-3)
- Progres: localStorage `sprachboss.progress` — `{exp, level, hpMax, unlocked, arcadeBest, streakBest, wrongWords[]}`
- `wrongWords`: array string DE yang sering salah → soal ini muncul 2x lebih sering

## Mode
### Campaign
- Peta linear 4 zona (Hotel → Essen → Smalltalk → Behörden), tiap zona 3 level (tier)
- Level: deret soal; HP musuh = 10 + level*5; benar = damage 1 + floor(streak/3); salah/timeout = player kena 1
- Menang level → EXP + unlock zona berikutnya

### Arcade
- 60 detik, soal acak semua tema, streak & combo multiplier, skor = (benar * 10) * (1 + floor(streak/5)*0.5)
- Simpan best score

## Battle loop
- Tampil vocab DE → 4 pilihan ID (atau sebaliknya 50/50)
- Timer: campaign 15s, arcade 8s
- Benar: damage = 1 + floor(streak/3); Salah/timeout: player kena 1

## UI
1. Home: pilih mode, status level+EXP, reset progres
2. Peta Kampanye: 4 zona, 3 level per zona, kunci sampai zona sebelumnya selesai
3. Battle: HP player & musuh, soal, 4 pilihan, timer bar, streak
4. Hasil: EXP, level up, unlock, arcade score

Bahasa UI: Indonesia.

## Error handling
- localStorage corrupt → reset aman
- Vocab habis → shuffle ulang

## Testing
- `node test.js` — assert: format vocab valid, 80 entry, 20/tema, damage formula, pick-4 unik, wrongWords bobot
- Browser headless: main 1 level campaign + arcade 60s, screenshot

## Skipped (ponytail)
- Sound, animasi kompleks, multiplayer online, AI-generated soal dinamis — tambah kalau core loop kepake.
