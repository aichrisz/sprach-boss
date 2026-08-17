// Sprach-Boss — game logic
// Vanilla JS, no deps. State di localStorage key "sprachboss.progress".

const STORAGE_KEY = "sprachboss.progress";
const DEFAULT_PROGRESS = {
  exp: 0,
  level: 1,
  hpMax: 10,
  unlocked: { hotel: 1, essen: 0, smalltalk: 0, behoerden: 0 }, // level tertinggi terbuka per tema (1-indexed)
  arcadeBest: 0,
  streakBest: 0,
  wrongWords: [] // array string DE yang sering salah
};

const ZONES = [
  { tema: "hotel", label: "Hotel", emoji: "🏨" },
  { tema: "essen", label: "Essen", emoji: "🍽️" },
  { tema: "smalltalk", label: "Smalltalk", emoji: "💬" },
  { tema: "behoerden", label: "Behörden", emoji: "🏛️" }
];
const LEVELS_PER_ZONE = 3;
const EXP_PER_LEVEL = 20;
const CAMPAIGN_TIMER_MS = 15000;
const ARCADE_TIMER_MS = 8000;
const ARCADE_DURATION_MS = 60000;

// ---------- state ----------
let progress = loadProgress();
let battle = null; // state battle aktif
const SOUND_KEY = "sprachboss.sound";
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; } })();
function saveSound() { try { localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off"); } catch {} }

// ---------- persistence ----------
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_PROGRESS);
    const p = JSON.parse(raw);
    // validasi minimal; kalau rusak, reset
    if (!p || typeof p !== "object" || !p.unlocked) return structuredClone(DEFAULT_PROGRESS);
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...p,
      unlocked: { ...DEFAULT_PROGRESS.unlocked, ...p.unlocked },
      wrongWords: Array.isArray(p.wrongWords) ? p.wrongWords : []
    };
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage penuh / private mode — abaikan, game tetap jalan in-memory
  }
}

function resetProgress() {
  progress = structuredClone(DEFAULT_PROGRESS);
  saveProgress();
  render();
}

// ---------- util ----------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function expForLevel(level) {
  return level * EXP_PER_LEVEL;
}

function addExp(n) {
  progress.exp += n;
  while (progress.exp >= expForLevel(progress.level)) {
    progress.exp -= expForLevel(progress.level);
    progress.level++;
    progress.hpMax = 10 + (progress.level - 1) * 2;
  }
}

function enemyHp(level) {
  return 10 + level * 5;
}

function playerDamage(streak) {
  return 1 + Math.floor(streak / 3);
}

// ---------- question generation ----------
// Pilih kandidat vocab: bobot ganda untuk wrongWords; fallback ke semua tema utk arcade.
function pickCandidates(tema, tier, count) {
  let pool;
  if (tema === "all") {
    pool = VOCAB.slice();
  } else if (tier) {
    pool = vocabByTier(tema, tier);
  } else {
    pool = vocabByTema(tema);
  }
  // wrongWords: naikkan bobot — duplikat entry yang sering salah
  const boosted = [];
  for (const v of pool) {
    boosted.push(v);
    if (progress.wrongWords.includes(v.de)) boosted.push(v);
  }
  const unique = [];
  const seen = new Set();
  for (const v of shuffle(boosted)) {
    if (!seen.has(v.de)) { seen.add(v.de); unique.push(v); }
  }
  return unique;
}

function makeQuestion(tema, tier) {
  const candidates = pickCandidates(tema, tier, 4);
  if (candidates.length < 2) return null;
  const correct = candidates[0];
  const reverse = Math.random() < 0.5; // 50%: tampil DE, jawab ID; 50% sebaliknya
  const prompt = reverse ? correct.de : correct.id;
  const answer = reverse ? correct.id : correct.de;
  // 3 pengecoh unik
  const wrongs = shuffle(candidates.slice(1)).slice(0, 3);
  const options = shuffle([answer, ...wrongs.map(w => (reverse ? w.id : w.de))]);
  return { prompt, answer, options, vocab: correct };
}

// ---------- sound (WebAudio, no asset files) ----------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq, dur, when = 0, type = "sine", vol = 0.15) {
  const ctx = ensureAudio();
  if (!ctx || !soundOn) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}
const sfx = {
  correct() { tone(523, 0.12, 0, "sine"); tone(659, 0.12, 0.08); },
  wrong() { tone(196, 0.2, 0, "square", 0.08); },
  victory() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, i * 0.12)); },
  defeat() { [392, 330, 262].forEach((f, i) => tone(f, 0.2, i * 0.15, "triangle", 0.12)); }
};

// ---------- battle ----------
function startCampaignLevel(tema, level) {
  const questions = [];
  const qs = makeQuestion(tema, level);
  if (!qs) return;
  // deret soal: 6 + level*2
  const count = 6 + level * 2;
  for (let i = 0; i < count; i++) {
    const q = makeQuestion(tema, level);
    if (q) questions.push(q);
  }
  if (questions.length === 0) return;
  battle = {
    mode: "campaign",
    tema,
    level,
    hp: progress.hpMax,
    maxHp: progress.hpMax,
    enemyHp: enemyHp(level),
    enemyMax: enemyHp(level),
    questions,
    qi: 0,
    streak: 0,
    timerMs: CAMPAIGN_TIMER_MS,
    timerEnd: 0,
    timerId: null,
    over: false
  };
  renderBattle();
}

function startArcade() {
  const questions = [];
  // 60 detik / 8s per soal → siapkan banyak
  for (let i = 0; i < 60; i++) {
    const q = makeQuestion("all", null);
    if (q) questions.push(q);
  }
  battle = {
    mode: "arcade",
    tema: "all",
    level: 0,
    hp: 1, // arcade: player tak kalah, cuma skor
    maxHp: 1,
    enemyHp: 0,
    enemyMax: 0,
    questions,
    qi: 0,
    streak: 0,
    score: 0,
    correct: 0,
    timerMs: ARCADE_TIMER_MS,
    timerEnd: 0,
    startTime: Date.now(),
    timerId: null,
    over: false
  };
  renderBattle();
}

function battleTick() {
  if (!battle || battle.over) return;
  const now = Date.now();
  if (now >= battle.timerEnd) {
    onAnswer(null); // timeout = salah
  }
}

function onAnswer(selected) {
  if (!battle || battle.over) return;
  clearTimeout(battle.timerId);
  const q = battle.questions[battle.qi];
  const isCorrect = selected !== null && selected === q.answer;

  if (battle.mode === "campaign") {
    if (isCorrect) {
      battle.streak++;
      battle.enemyHp -= playerDamage(battle.streak);
      sfx.correct();
      if (battle.enemyHp <= 0) {
        battle.enemyHp = 0;
        endBattle(true);
        return;
      }
    } else {
      battle.streak = 0;
      battle.hp--;
      sfx.wrong();
      if (battle.hp <= 0) {
        battle.hp = 0;
        endBattle(false);
        return;
      }
      recordWrong(q.vocab);
    }
  } else {
    // arcade
    if (isCorrect) {
      battle.streak++;
      battle.correct++;
      battle.score += Math.round(10 * (1 + Math.floor(battle.streak / 5) * 0.5));
      sfx.correct();
      if (battle.streak > progress.streakBest) progress.streakBest = battle.streak;
    } else {
      battle.streak = 0;
      sfx.wrong();
      recordWrong(q.vocab);
    }
    if (Date.now() - battle.startTime >= ARCADE_DURATION_MS) {
      endBattle(true);
      return;
    }
  }

  battle.qi++;
  if (battle.qi >= battle.questions.length) {
    endBattle(true);
    return;
  }
  renderBattle();
}

function recordWrong(vocab) {
  if (!progress.wrongWords.includes(vocab.de)) {
    progress.wrongWords.push(vocab.de);
    // batasi panjang
    if (progress.wrongWords.length > 30) progress.wrongWords.shift();
  }
}

function endBattle(win) {
  battle.over = true;
  clearTimeout(battle.timerId);
  if (win) sfx.victory(); else sfx.defeat();

  if (battle.mode === "campaign") {
    if (win) {
      addExp(EXP_PER_LEVEL);
      // unlock level berikutnya di zona ini (maks 3)
      const cur = progress.unlocked[battle.tema] || 0;
      if (battle.level >= cur && cur < LEVELS_PER_ZONE) {
        progress.unlocked[battle.tema] = battle.level + 1;
      }
      // unlock zona berikutnya kalau zona ini tuntas (level 3 selesai)
      if (battle.level >= LEVELS_PER_ZONE) {
        const zi = ZONES.findIndex(z => z.tema === battle.tema);
        const next = ZONES[zi + 1];
        if (next && (progress.unlocked[next.tema] || 0) < 1) {
          progress.unlocked[next.tema] = 1;
        }
      }
    }
    // campurkan kosakata yang kalah ke wrongWords (boost belajar)
    if (!win) {
      battle.questions.forEach(q => { if (q.vocab) recordWrong(q.vocab); });
    }
  } else {
    // arcade
    if (battle.score > progress.arcadeBest) progress.arcadeBest = battle.score;
  }
  saveProgress();
  renderResult(win);
}

// ---------- render ----------
const app = document.getElementById("app");

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function render() {
  battle = null;
  renderHome();
}

function renderHome() {
  app.innerHTML = "";
  const wrap = el("div", "screen home");
  wrap.appendChild(el("h1", "title", "Sprach-Boss 🗡️"));
  wrap.appendChild(el("p", "subtitle", "Belajar Jerman, kalahkan bos!"));

  const stats = el("div", "stats");
  stats.appendChild(el("div", "stat", `Level ${progress.level}`));
  stats.appendChild(el("div", "stat", `EXP ${progress.exp}/${expForLevel(progress.level)}`));
  stats.appendChild(el("div", "stat", `Arcade Best: ${progress.arcadeBest}`));
  wrap.appendChild(stats);

  const btns = el("div", "menu");
  const btnCampaign = el("button", "btn primary", "Kampanye ⚔️");
  btnCampaign.onclick = () => renderMap();
  const btnArcade = el("button", "btn", "Arcade ⏱️");
  btnArcade.onclick = () => startArcade();
  const btnReset = el("button", "btn danger", "Reset Progres");
  btnReset.onclick = () => { if (confirm("Hapus semua progres?")) resetProgress(); };
  const btnSound = el("button", "btn", soundOn ? "🔊 Suara: ON" : "🔇 Suara: OFF");
  btnSound.onclick = () => { soundOn = !soundOn; saveSound(); renderHome(); };
  btns.append(btnCampaign, btnArcade, btnReset, btnSound);
  wrap.appendChild(btns);

  if (progress.wrongWords.length > 0) {
    const ww = el("div", "wronglist");
    ww.appendChild(el("h3", "", "Kosakata yang perlu diulang:"));
    const ul = el("ul", "");
    progress.wrongWords.slice(-10).forEach(w => ul.appendChild(el("li", "", w)));
    ww.appendChild(ul);
    wrap.appendChild(ww);
  }

  app.appendChild(wrap);
}

function renderMap() {
  app.innerHTML = "";
  const wrap = el("div", "screen map");
  const back = el("button", "btn back", "← Home");
  back.onclick = () => render();
  wrap.appendChild(back);
  wrap.appendChild(el("h2", "", "Peta Kampanye"));

  ZONES.forEach((z, zi) => {
    const zoneDiv = el("div", "zone");
    const unlockedLv = progress.unlocked[z.tema] || 0;
    const locked = unlockedLv < 1;
    zoneDiv.appendChild(el("h3", locked ? "zone-title locked" : "zone-title", `${z.emoji} ${z.label}${locked ? " 🔒" : ""}`));
    for (let lv = 1; lv <= LEVELS_PER_ZONE; lv++) {
      const btn = el("button", "btn level" + (lv > unlockedLv ? " locked" : ""), `Level ${lv}${lv > unlockedLv ? " 🔒" : ""}`);
      btn.disabled = lv > unlockedLv;
      if (!btn.disabled) btn.onclick = () => startCampaignLevel(z.tema, lv);
      zoneDiv.appendChild(btn);
    }
    wrap.appendChild(zoneDiv);
  });

  app.appendChild(wrap);
}

function renderBattle() {
  if (!battle) return;
  app.innerHTML = "";
  const wrap = el("div", "screen battle");

  // HP bars
  const bars = el("div", "bars");
  const playerBar = el("div", "bar");
  playerBar.appendChild(el("span", "bar-label", "Kamu"));
  playerBar.appendChild(el("div", "bar-track", ""));
  const pFill = el("div", "bar-fill player");
  pFill.style.width = (battle.hp / battle.maxHp * 100) + "%";
  playerBar.querySelector(".bar-track").appendChild(pFill);
  bars.appendChild(playerBar);

  if (battle.mode === "campaign") {
    const enemyBar = el("div", "bar");
    enemyBar.appendChild(el("span", "bar-label", "Bos"));
    enemyBar.appendChild(el("div", "bar-track", ""));
    const eFill = el("div", "bar-fill enemy");
    eFill.style.width = (battle.enemyHp / battle.enemyMax * 100) + "%";
    enemyBar.querySelector(".bar-track").appendChild(eFill);
    bars.appendChild(enemyBar);
  }
  wrap.appendChild(bars);

  // streak
  wrap.appendChild(el("div", "streak", `🔥 Streak: ${battle.streak}`));

  // soal
  const q = battle.questions[battle.qi];
  if (!q) { endBattle(true); return; }
  wrap.appendChild(el("div", "question", q.prompt));

  // timer bar
  const timerBar = el("div", "timer-track");
  const timerFill = el("div", "timer-fill");
  timerBar.appendChild(timerFill);
  wrap.appendChild(timerBar);

  // opsi
  const opts = el("div", "options");
  q.options.forEach((opt, i) => {
    const b = el("button", "btn option", opt);
    b.onclick = () => onAnswer(opt);
    opts.appendChild(b);
  });
  wrap.appendChild(opts);

  // progres soal
  wrap.appendChild(el("div", "qprogress", `Soal ${battle.qi + 1}/${battle.questions.length}${battle.mode === "arcade" ? ` · Skor ${battle.score}` : ""}`));

  app.appendChild(wrap);

  // timer
  battle.timerEnd = Date.now() + battle.timerMs;
  const total = battle.timerMs;
  const t0 = Date.now();
  function tickTimer() {
    if (!battle || battle.over) return;
    const remain = battle.timerEnd - Date.now();
    if (remain <= 0) {
      timerFill.style.width = "0%";
      onAnswer(null);
      return;
    }
    timerFill.style.width = (remain / total * 100) + "%";
    battle.timerId = setTimeout(tickTimer, 100);
  }
  tickTimer();
}

function renderResult(win) {
  app.innerHTML = "";
  const wrap = el("div", "screen result");
  if (battle.mode === "campaign") {
    wrap.appendChild(el("h2", win ? "victory" : "defeat", win ? "🎉 Menang!" : "💀 Kalah..."));
    wrap.appendChild(el("p", "", win ? `Level ${battle.level} selesai! +${EXP_PER_LEVEL} EXP` : "Coba lagi, kosakata muncul lebih sering di sesi berikutnya."));
    wrap.appendChild(el("p", "", `Level kamu: ${progress.level} (HP max ${progress.hpMax})`));
  } else {
    wrap.appendChild(el("h2", "", "⏱️ Arcade Selesai!"));
    wrap.appendChild(el("p", "", `Skor: ${battle.score} · Benar: ${battle.correct} · Streak terbaik: ${battle.streak}`));
    wrap.appendChild(el("p", "", `Best score: ${progress.arcadeBest}`));
  }
  const btn = el("button", "btn primary", "Kembali ke Home");
  btn.onclick = () => render();
  wrap.appendChild(btn);
  app.appendChild(wrap);
}

// start
render();
