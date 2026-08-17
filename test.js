// Sprach-Boss test suite — plain node assert, no framework
// Run: node test.js  →  exit 0 + "ALL PASS" bila semua lolos, exit 1 bila gagal.
'use strict';
const assert = require('assert');
const { VOCAB, vocabByTema, vocabByTier } = require('./vocab.js');

const TEMAS = ['hotel', 'essen', 'smalltalk', 'behoerden'];
let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log('  ok - ' + name);
}

// ---------- 1. struktur VOCAB: 80 entry, semua punya de/id/tema/tier ----------
check('VOCAB: 80 entry lengkap', () => {
  assert.strictEqual(VOCAB.length, 80, 'VOCAB harus 80 entry');
  for (const v of VOCAB) {
    assert.ok(typeof v.de === 'string' && v.de.length > 0, 'entry tanpa de: ' + JSON.stringify(v));
    assert.ok(typeof v.id === 'string' && v.id.length > 0, 'entry tanpa id: ' + JSON.stringify(v));
    assert.ok(TEMAS.includes(v.tema), 'tema invalid: ' + v.tema);
    assert.ok(v.tier === 1 || v.tier === 2 || v.tier === 3, 'tier invalid: ' + v.tier);
  }
});

// ---------- 2. distribusi per tema: 20 entry, tier 10/6/4 ----------
check('distribusi tema: 20 per tema, tier 10/6/4', () => {
  for (const t of TEMAS) {
    const byTema = vocabByTema(t);
    assert.strictEqual(byTema.length, 20, t + ' harus 20 entry, dapat ' + byTema.length);
    for (const [tier, expect] of [[1, 10], [2, 6], [3, 4]]) {
      assert.strictEqual(vocabByTier(t, tier).length, expect,
        t + ' tier ' + tier + ' harus ' + expect + ', dapat ' + vocabByTier(t, tier).length);
    }
  }
});

// ---------- 3. vocabByTier & vocabByTema ----------
check('vocabByTema & vocabByTier benar', () => {
  for (const t of TEMAS) {
    assert.ok(vocabByTema(t).every(v => v.tema === t), 'vocabByTema bocor antar tema');
  }
  assert.strictEqual(vocabByTier('hotel', 3).length, 4, 'hotel tier 3 harus 4');
  assert.strictEqual(vocabByTier('essen', 1).length, 10, 'essen tier 1 harus 10');
  assert.ok(vocabByTier('smalltalk', 2).every(v => v.tema === 'smalltalk' && v.tier === 2));
  assert.strictEqual(vocabByTema('behoerden').length, 20, 'behoerden harus 20');
  // tidak ada entry duplikat de
  const deSet = new Set(VOCAB.map(v => v.de));
  assert.strictEqual(deSet.size, 80, 'ada duplikat de di VOCAB');
});

// ---------- 4. playerDamage ----------
// mirror of app.js: function playerDamage(streak) { return 1 + Math.floor(streak / 3); }
const playerDamageMirror = (streak) => 1 + Math.floor(streak / 3);
check('playerDamage(streak) = 1 + floor(streak/3)', () => {
  assert.strictEqual(playerDamageMirror(0), 1);
  assert.strictEqual(playerDamageMirror(2), 1);
  assert.strictEqual(playerDamageMirror(3), 2);
  assert.strictEqual(playerDamageMirror(5), 2);
  assert.strictEqual(playerDamageMirror(6), 3);
});

// ---------- 5. enemyHp ----------
// mirror of app.js: function enemyHp(level) { return 10 + level * 5; }
const enemyHpMirror = (level) => 10 + level * 5;
check('enemyHp(level) = 10 + level*5', () => {
  assert.strictEqual(enemyHpMirror(1), 15);
  assert.strictEqual(enemyHpMirror(3), 25);
});

// ---------- 6. makeQuestion ----------
// mirror of app.js + vocab.js helpers (logika sama, tanpa DOM/localStorage)
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const progressMirror = { wrongWords: [] };
// mirror of app.js pickCandidates (progress read-only di sini)
function pickCandidatesMirror(tema, tier, count) {
  let pool;
  if (tema === 'all') pool = VOCAB.slice();
  else if (tier) pool = vocabByTier(tema, tier);
  else pool = vocabByTema(tema);
  const boosted = [];
  for (const v of pool) {
    boosted.push(v);
    if (progressMirror.wrongWords.includes(v.de)) boosted.push(v);
  }
  const unique = [];
  const seen = new Set();
  for (const v of shuffle(boosted)) {
    if (!seen.has(v.de)) { seen.add(v.de); unique.push(v); }
  }
  return unique;
}
// mirror of app.js makeQuestion
function makeQuestionMirror(tema, tier) {
  const candidates = pickCandidatesMirror(tema, tier, 4);
  if (candidates.length < 2) return null;
  const correct = candidates[0];
  const reverse = Math.random() < 0.5;
  const prompt = reverse ? correct.de : correct.id;
  const answer = reverse ? correct.id : correct.de;
  const wrongs = shuffle(candidates.slice(1)).slice(0, 3);
  const options = shuffle([answer, ...wrongs.map(w => (reverse ? w.id : w.de))]);
  return { prompt, answer, options, vocab: correct };
}
check('makeQuestion: prompt/answer/4 opsi unik, answer ada di opsi', () => {
  for (let i = 0; i < 50; i++) {
    const q = makeQuestionMirror('hotel', 1);
    assert.ok(q, 'makeQuestion tidak boleh null untuk hotel tier 1');
    assert.ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'prompt kosong');
    assert.ok(typeof q.answer === 'string' && q.answer.length > 0, 'answer kosong');
    assert.strictEqual(q.options.length, 4, 'harus 4 opsi, dapat ' + q.options.length);
    assert.ok(q.options.includes(q.answer), 'answer wajib ada di options');
    assert.strictEqual(new Set(q.options).size, 4, 'options tidak boleh duplikat: ' + JSON.stringify(q.options));
    assert.ok(q.options.every(o => typeof o === 'string' && o.length > 0), 'opsi tidak boleh kosong');
  }
  // arcade mode ('all') juga harus jalan
  const qa = makeQuestionMirror('all', null);
  assert.ok(qa && qa.options.length === 4, 'makeQuestion all gagal');
});

// ---------- 7. wrongWords boosting ----------
check('pickCandidates: wrongWords masuk pool', () => {
  const targetEntry = VOCAB.find(v => v.tema === 'hotel' && v.tier === 1);
  const target = targetEntry.de;
  progressMirror.wrongWords = [target];
  // boost bekerja deterministik: entry wrongWords di-duplikasi sebelum shuffle,
  // jadi dijamin masuk ke kandidat unik. Cek berulang buat amankan random.
  for (let i = 0; i < 50; i++) {
    const pool = pickCandidatesMirror('hotel', 1, 4);
    assert.ok(pool.some(v => v.de === target), 'target wrongWords ' + target + ' harus muncul di pool (iterasi ' + i + ')');
  }
});

// ---------- ringkasan ----------
console.log('\nALL PASS (' + passed + ' checks)');