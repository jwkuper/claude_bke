const RIJEN   = 6;
const KOLOMMEN = 7;

// ── Spelstaat ────────────────────────────────────────────────
let bord;         // 2D array [rij][kolom]: null | 1 | 2
let huidigeSpeler;
let spelActief;
let score = { 1: 0, 2: 0, gelijk: 0 };

// ── AI-instellingen ──────────────────────────────────────────
let tegenAI = false;
let moeilijkheid = 3;
let aiBeginnen = false;
const MENS_SPELER = 1;
const AI_SPELER   = 2;

// ── DOM ──────────────────────────────────────────────────────
const bordEl        = document.getElementById('bord');
const kolKnoppenEl  = document.getElementById('kolom-knoppen');
const berichtEl     = document.getElementById('bericht');
const huidigeEl     = document.getElementById('huidige-speler');
const score1El      = document.getElementById('score-1');
const score2El      = document.getElementById('score-2');
const scoreGelijkEl = document.getElementById('score-gelijk');
const speler1El     = document.getElementById('speler-1');
const speler2El     = document.getElementById('speler-2');
const naam2El       = document.getElementById('naam-2');
const nieuwSpelKnop  = document.getElementById('nieuw-spel');
const resetScoreKnop = document.getElementById('reset-score');
const mode2SpelersKnop  = document.getElementById('mode-2spelers');
const modeAIKnop        = document.getElementById('mode-ai');
const aiOptiesEl        = document.getElementById('ai-opties');
const moeilijkheidSelect = document.getElementById('moeilijkheid');
const begintSpelerKnop  = document.getElementById('begint-speler');
const begintAIKnop      = document.getElementById('begint-ai');

// ── Bord ─────────────────────────────────────────────────────
function bouwBord() {
  bordEl.innerHTML = '';
  for (let r = 0; r < RIJEN; r++) {
    for (let k = 0; k < KOLOMMEN; k++) {
      const cel = document.createElement('div');
      cel.classList.add('cel');
      cel.dataset.rij = r;
      cel.dataset.kolom = k;
      bordEl.appendChild(cel);
    }
  }
}

function getCel(rij, kolom) {
  return bordEl.querySelector(`.cel[data-rij="${rij}"][data-kolom="${kolom}"]`);
}

function updateActieveSpeler() {
  speler1El.classList.toggle('actief', huidigeSpeler === 1);
  speler2El.classList.toggle('actief', huidigeSpeler === 2);
  const label = (tegenAI && huidigeSpeler === AI_SPELER) ? 'AI' : `Speler ${huidigeSpeler}`;
  huidigeEl.textContent = label;
  huidigeEl.style.color = huidigeSpeler === 1
    ? 'var(--color-speler1)'
    : 'var(--color-speler2)';
}

function laagsteLegeRij(kolom, b = bord) {
  for (let r = RIJEN - 1; r >= 0; r--) {
    if (b[r][kolom] === null) return r;
  }
  return -1;
}

function updateKolomKnoppen() {
  document.querySelectorAll('.kolom-knop').forEach(knop => {
    const k = Number(knop.dataset.col);
    knop.classList.toggle('vol', laagsteLegeRij(k) === -1);
  });
}

function controleerVier(rij, kolom, speler, b = bord) {
  const richtingen = [
    { dr: 0,  dk: 1  },
    { dr: 1,  dk: 0  },
    { dr: 1,  dk: 1  },
    { dr: 1,  dk: -1 },
  ];

  for (const { dr, dk } of richtingen) {
    const cellen = [[rij, kolom]];
    for (const richting of [1, -1]) {
      let r = rij + dr * richting;
      let k = kolom + dk * richting;
      while (r >= 0 && r < RIJEN && k >= 0 && k < KOLOMMEN && b[r][k] === speler) {
        cellen.push([r, k]);
        r += dr * richting;
        k += dk * richting;
      }
    }
    if (cellen.length >= 4) return cellen;
  }
  return null;
}

function controleerGelijkspel(b = bord) {
  return b[0].every(cel => cel !== null);
}

// ── Zet plaatsen op DOM ──────────────────────────────────────
function plaatsZetDOM(rij, kolom, speler) {
  const cel = getCel(rij, kolom);
  cel.classList.add(`speler${speler}`);
  const schijf = document.createElement('div');
  schijf.classList.add('schijf');
  cel.appendChild(schijf);
}

// ── Spelresultaat ────────────────────────────────────────────
function verwerkResultaat(winnendeCellen, speler) {
  spelActief = false;
  if (winnendeCellen) {
    winnendeCellen.forEach(([r, k]) => getCel(r, k).classList.add('winnend'));
    if (tegenAI) {
      berichtEl.textContent = speler === MENS_SPELER ? 'Jij wint!' : 'AI wint!';
    } else {
      berichtEl.textContent = `Speler ${speler} wint!`;
    }
    berichtEl.style.color = 'var(--color-accent)';
    score[speler]++;
    score1El.textContent = score[1];
    score2El.textContent = score[2];
  } else {
    berichtEl.textContent = 'Gelijkspel!';
    berichtEl.style.color = 'var(--color-muted)';
    score.gelijk++;
    scoreGelijkEl.textContent = score.gelijk;
  }
  huidigeEl.textContent = '-';
  huidigeEl.style.color = '';
}

// ── Menselijke klik ──────────────────────────────────────────
function verwerkKlik(kolom) {
  if (!spelActief) return;
  if (tegenAI && huidigeSpeler === AI_SPELER) return;
  const rij = laagsteLegeRij(kolom);
  if (rij === -1) return;

  bord[rij][kolom] = huidigeSpeler;
  plaatsZetDOM(rij, kolom, huidigeSpeler);
  updateKolomKnoppen();

  const winnendeCellen = controleerVier(rij, kolom, huidigeSpeler);
  if (winnendeCellen) {
    verwerkResultaat(winnendeCellen, huidigeSpeler);
    return;
  }
  if (controleerGelijkspel()) {
    verwerkResultaat(null, null);
    return;
  }

  huidigeSpeler = huidigeSpeler === 1 ? 2 : 1;
  updateActieveSpeler();

  if (tegenAI && huidigeSpeler === AI_SPELER) {
    setTimeout(voerAIZetUit, 450);
  }
}

// ── Nieuw spel ───────────────────────────────────────────────
function nieuwSpel() {
  bord = Array.from({ length: RIJEN }, () => Array(KOLOMMEN).fill(null));
  spelActief = true;
  berichtEl.textContent = '';
  berichtEl.style.color = 'var(--color-accent)';
  bouwBord();
  updateKolomKnoppen();

  huidigeSpeler = (tegenAI && aiBeginnen) ? AI_SPELER : MENS_SPELER;
  updateActieveSpeler();

  if (tegenAI && aiBeginnen) {
    setTimeout(voerAIZetUit, 450);
  }
}

function resetScore() {
  score = { 1: 0, 2: 0, gelijk: 0 };
  score1El.textContent = 0;
  score2El.textContent = 0;
  scoreGelijkEl.textContent = 0;
  nieuwSpel();
}

// ── AI: Heuristiek ───────────────────────────────────────────
function telReeks(venster, speler) {
  const tegenstander = speler === AI_SPELER ? MENS_SPELER : AI_SPELER;
  const ai    = venster.filter(v => v === speler).length;
  const mens  = venster.filter(v => v === tegenstander).length;
  const leeg  = venster.filter(v => v === null).length;
  if (mens > 0) return 0;
  if (ai === 4) return 100;
  if (ai === 3 && leeg === 1) return 5;
  if (ai === 2 && leeg === 2) return 2;
  return 0;
}

function heuristiek(b) {
  let score = 0;
  const midCol = Math.floor(KOLOMMEN / 2);

  // Middelkolom voorkeur
  for (let r = 0; r < RIJEN; r++) {
    if (b[r][midCol] === AI_SPELER)   score += 3;
    if (b[r][midCol] === MENS_SPELER) score -= 3;
  }

  const richtingen = [
    { dr: 0, dk: 1  },
    { dr: 1, dk: 0  },
    { dr: 1, dk: 1  },
    { dr: 1, dk: -1 },
  ];

  for (const { dr, dk } of richtingen) {
    for (let r = 0; r < RIJEN; r++) {
      for (let k = 0; k < KOLOMMEN; k++) {
        const venster = [];
        let geldig = true;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nk = k + dk * i;
          if (nr < 0 || nr >= RIJEN || nk < 0 || nk >= KOLOMMEN) { geldig = false; break; }
          venster.push(b[nr][nk]);
        }
        if (!geldig) continue;
        score += telReeks(venster, AI_SPELER);
        score -= telReeks(venster, MENS_SPELER);
      }
    }
  }
  return score;
}

// Snel controleren of een zet wint op bordkopie
function zetWint(b, rij, kolom, speler) {
  return controleerVier(rij, kolom, speler, b) !== null;
}

// ── AI: Minimax met alpha-beta ───────────────────────────────
function minimax(b, diepte, alpha, beta, isMaximiserend) {
  // Terminatiecondities: controleer alle mogelijke zetten op winst
  const geldigeKolommen = [];
  for (let k = 0; k < KOLOMMEN; k++) {
    const r = laagsteLegeRij(k, b);
    if (r !== -1) geldigeKolommen.push({ k, r });
  }

  if (geldigeKolommen.length === 0) return 0; // gelijkspel

  if (diepte === 0) return heuristiek(b);

  if (isMaximiserend) {
    let beste = -Infinity;
    for (const { k, r } of geldigeKolommen) {
      b[r][k] = AI_SPELER;
      if (zetWint(b, r, k, AI_SPELER)) {
        b[r][k] = null;
        return 100000 + diepte;
      }
      const val = minimax(b, diepte - 1, alpha, beta, false);
      b[r][k] = null;
      beste = Math.max(beste, val);
      alpha = Math.max(alpha, beste);
      if (alpha >= beta) break;
    }
    return beste;
  } else {
    let beste = Infinity;
    for (const { k, r } of geldigeKolommen) {
      b[r][k] = MENS_SPELER;
      if (zetWint(b, r, k, MENS_SPELER)) {
        b[r][k] = null;
        return -(100000 + diepte);
      }
      const val = minimax(b, diepte - 1, alpha, beta, true);
      b[r][k] = null;
      beste = Math.min(beste, val);
      beta = Math.min(beta, beste);
      if (alpha >= beta) break;
    }
    return beste;
  }
}

function besteKolom(diepte) {
  const kopie = bord.map(r => [...r]);
  let besteScore = -Infinity;
  let besteK = -1;

  // Midden-eerst volgorde voor betere pruning
  const volgorde = [3, 2, 4, 1, 5, 0, 6];
  for (const k of volgorde) {
    const r = laagsteLegeRij(k, kopie);
    if (r === -1) continue;
    kopie[r][k] = AI_SPELER;
    if (zetWint(kopie, r, k, AI_SPELER)) {
      kopie[r][k] = null;
      return k; // directe win, pak hem
    }
    kopie[r][k] = null;
  }

  for (const k of volgorde) {
    const r = laagsteLegeRij(k, kopie);
    if (r === -1) continue;
    kopie[r][k] = AI_SPELER;
    const val = minimax(kopie, diepte - 1, -Infinity, Infinity, false);
    kopie[r][k] = null;
    if (val > besteScore) {
      besteScore = val;
      besteK = k;
    }
  }
  return besteK;
}

function willekeurigeGeldigeKolom() {
  const lege = [];
  for (let k = 0; k < KOLOMMEN; k++) {
    if (laagsteLegeRij(k) !== -1) lege.push(k);
  }
  return lege[Math.floor(Math.random() * lege.length)];
}

function voerAIZetUit() {
  if (!spelActief) return;

  let kolom;
  switch (moeilijkheid) {
    case 1:
      kolom = willekeurigeGeldigeKolom();
      break;
    case 2:
      kolom = Math.random() < 0.5 ? willekeurigeGeldigeKolom() : besteKolom(1);
      break;
    case 3:
      kolom = besteKolom(3);
      break;
    case 4:
      kolom = besteKolom(5);
      break;
    case 5:
    default:
      kolom = besteKolom(7);
      break;
  }

  const rij = laagsteLegeRij(kolom);
  bord[rij][kolom] = AI_SPELER;
  plaatsZetDOM(rij, kolom, AI_SPELER);
  updateKolomKnoppen();

  const winnendeCellen = controleerVier(rij, kolom, AI_SPELER);
  if (winnendeCellen) {
    verwerkResultaat(winnendeCellen, AI_SPELER);
    return;
  }
  if (controleerGelijkspel()) {
    verwerkResultaat(null, null);
    return;
  }

  huidigeSpeler = MENS_SPELER;
  updateActieveSpeler();
}

// ── Mode-kiezer handlers ─────────────────────────────────────
mode2SpelersKnop.addEventListener('click', () => {
  tegenAI = false;
  mode2SpelersKnop.classList.add('actief');
  modeAIKnop.classList.remove('actief');
  aiOptiesEl.style.display = 'none';
  naam2El.textContent = 'Speler 2';
  resetScore();
});

modeAIKnop.addEventListener('click', () => {
  tegenAI = true;
  modeAIKnop.classList.add('actief');
  mode2SpelersKnop.classList.remove('actief');
  aiOptiesEl.style.display = 'flex';
  naam2El.textContent = 'AI';
  resetScore();
});

moeilijkheidSelect.addEventListener('change', () => {
  moeilijkheid = Number(moeilijkheidSelect.value);
  nieuwSpel();
});

begintSpelerKnop.addEventListener('click', () => {
  aiBeginnen = false;
  begintSpelerKnop.classList.add('actief');
  begintAIKnop.classList.remove('actief');
  nieuwSpel();
});

begintAIKnop.addEventListener('click', () => {
  aiBeginnen = true;
  begintAIKnop.classList.add('actief');
  begintSpelerKnop.classList.remove('actief');
  nieuwSpel();
});

// ── Kolom-klik events ────────────────────────────────────────
kolKnoppenEl.addEventListener('click', (e) => {
  const knop = e.target.closest('.kolom-knop');
  if (knop && !knop.classList.contains('vol')) {
    verwerkKlik(Number(knop.dataset.col));
  }
});

nieuwSpelKnop.addEventListener('click', nieuwSpel);
resetScoreKnop.addEventListener('click', resetScore);

// Start
nieuwSpel();
