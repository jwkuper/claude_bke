const WINNENDE_COMBINATIES = [
  [0, 1, 2], // rij 1
  [3, 4, 5], // rij 2
  [6, 7, 8], // rij 3
  [0, 3, 6], // kolom 1
  [1, 4, 7], // kolom 2
  [2, 5, 8], // kolom 3
  [0, 4, 8], // diagonaal
  [2, 4, 6], // diagonaal
];

// ── Spelstaat ────────────────────────────────────────────────
let bord = Array(9).fill(null);
let huidigeSpeler = 'X';
let spelActief = true;
let score = { X: 0, O: 0, gelijk: 0 };

// ── AI-instellingen ──────────────────────────────────────────
let tegenAI = false;
let moeilijkheid = 3;
let aiBeginnen = false;
const MENS_SPELER = 'X';
const AI_SPELER   = 'O';

// ── DOM ──────────────────────────────────────────────────────
const vakjes = document.querySelectorAll('.vakje');
const berichtEl = document.getElementById('bericht');
const huidigeSpelerEl = document.getElementById('huidige-speler');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreGelijkEl = document.getElementById('score-gelijk');
const spelerXEl = document.getElementById('speler-x');
const spelerOEl = document.getElementById('speler-o');
const naamOEl = document.getElementById('naam-o');
const nieuwSpelKnop = document.getElementById('nieuw-spel');
const resetScoreKnop = document.getElementById('reset-score');
const mode2SpelersKnop = document.getElementById('mode-2spelers');
const modeAIKnop = document.getElementById('mode-ai');
const aiOptiesEl = document.getElementById('ai-opties');
const moeilijkheidSelect = document.getElementById('moeilijkheid');
const begintSpelerKnop = document.getElementById('begint-speler');
const begintAIKnop = document.getElementById('begint-ai');

// ── Spelersweergave ──────────────────────────────────────────
function updateActieveSpeler() {
  spelerXEl.classList.toggle('actief', huidigeSpeler === 'X');
  spelerOEl.classList.toggle('actief', huidigeSpeler === 'O');
  huidigeSpelerEl.textContent = huidigeSpeler;
  huidigeSpelerEl.style.color = huidigeSpeler === 'X' ? '#64b4ff' : '#ff6b8a';
}

// ── Winnaarcontrole ──────────────────────────────────────────
function controleerWinnaar() {
  for (const combo of WINNENDE_COMBINATIES) {
    const [a, b, c] = combo;
    if (bord[a] && bord[a] === bord[b] && bord[a] === bord[c]) {
      return { winnaar: bord[a], combo };
    }
  }
  if (bord.every(v => v !== null)) {
    return { winnaar: null, gelijkspel: true };
  }
  return null;
}

// ── Zet plaatsen (ook intern gebruikt door AI) ────────────────
function plaatsZet(index, speler) {
  bord[index] = speler;
  const vakje = vakjes[index];
  vakje.classList.add('bezet', speler.toLowerCase());
  vakje.innerHTML = `<span class="teken">${speler}</span>`;
}

// ── Spelresultaat verwerken ──────────────────────────────────
function verwerkResultaat(resultaat) {
  if (resultaat.gelijkspel) {
    berichtEl.textContent = 'Gelijkspel!';
    berichtEl.style.color = '#aaa';
    score.gelijk++;
    scoreGelijkEl.textContent = score.gelijk;
  } else {
    let naam;
    if (tegenAI) {
      naam = resultaat.winnaar === MENS_SPELER ? 'Jij wint!' : 'AI wint!';
      berichtEl.textContent = naam;
    } else {
      naam = resultaat.winnaar === 'X' ? 'Speler 1' : 'Speler 2';
      berichtEl.textContent = `${naam} (${resultaat.winnaar}) wint!`;
    }
    berichtEl.style.color = '#ffd750';
    resultaat.combo.forEach(i => vakjes[i].classList.add('winnend'));
    score[resultaat.winnaar]++;
    scoreXEl.textContent = score.X;
    scoreOEl.textContent = score.O;
  }
  spelActief = false;
  huidigeSpelerEl.textContent = '-';
}

// ── Menselijke klik ──────────────────────────────────────────
function verwerkKlik(index) {
  if (!spelActief || bord[index]) return;
  if (tegenAI && huidigeSpeler === AI_SPELER) return;

  plaatsZet(index, huidigeSpeler);
  const resultaat = controleerWinnaar();
  if (resultaat) {
    verwerkResultaat(resultaat);
    return;
  }
  huidigeSpeler = huidigeSpeler === 'X' ? 'O' : 'X';
  updateActieveSpeler();

  if (tegenAI && huidigeSpeler === AI_SPELER) {
    setTimeout(voerAIZetUit, 400);
  }
}

// ── Nieuw spel ───────────────────────────────────────────────
function nieuwSpel() {
  bord = Array(9).fill(null);
  spelActief = true;
  berichtEl.textContent = '';
  berichtEl.style.color = '#ffd750';

  vakjes.forEach(vakje => {
    vakje.className = 'vakje';
    vakje.innerHTML = '';
  });

  huidigeSpeler = (tegenAI && aiBeginnen) ? AI_SPELER : MENS_SPELER;
  updateActieveSpeler();

  if (tegenAI && aiBeginnen) {
    setTimeout(voerAIZetUit, 400);
  }
}

function resetScore() {
  score = { X: 0, O: 0, gelijk: 0 };
  scoreXEl.textContent = 0;
  scoreOEl.textContent = 0;
  scoreGelijkEl.textContent = 0;
  nieuwSpel();
}

// ── AI: Minimax ──────────────────────────────────────────────
function minimax(bordKopie, speler, isMaximiserend) {
  // Controleer eindtoestand op bordKopie
  for (const combo of WINNENDE_COMBINATIES) {
    const [a, b, c] = combo;
    if (bordKopie[a] && bordKopie[a] === bordKopie[b] && bordKopie[a] === bordKopie[c]) {
      return bordKopie[a] === AI_SPELER ? 10 : -10;
    }
  }
  if (bordKopie.every(v => v !== null)) return 0;

  const lege = bordKopie.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);

  if (isMaximiserend) {
    let beste = -Infinity;
    for (const i of lege) {
      bordKopie[i] = AI_SPELER;
      beste = Math.max(beste, minimax(bordKopie, AI_SPELER, false));
      bordKopie[i] = null;
    }
    return beste;
  } else {
    let beste = Infinity;
    for (const i of lege) {
      bordKopie[i] = MENS_SPELER;
      beste = Math.min(beste, minimax(bordKopie, MENS_SPELER, true));
      bordKopie[i] = null;
    }
    return beste;
  }
}

function besteZetMinimax() {
  const kopie = [...bord];
  let besteScore = -Infinity;
  let besteIndex = -1;
  const lege = kopie.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  for (const i of lege) {
    kopie[i] = AI_SPELER;
    const score = minimax(kopie, AI_SPELER, false);
    kopie[i] = null;
    if (score > besteScore) {
      besteScore = score;
      besteIndex = i;
    }
  }
  return besteIndex;
}

function willekeurigeZet() {
  const lege = bord.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  return lege[Math.floor(Math.random() * lege.length)];
}

function blokkeerOfWillekeurig() {
  // Blokkeer directe win mens
  const kopie = [...bord];
  const lege = kopie.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  for (const i of lege) {
    kopie[i] = MENS_SPELER;
    for (const combo of WINNENDE_COMBINATIES) {
      const [a, b, c] = combo;
      if (kopie[a] && kopie[a] === kopie[b] && kopie[a] === kopie[c]) {
        return i; // blokkeer
      }
    }
    kopie[i] = null;
  }
  return willekeurigeZet();
}

function voerAIZetUit() {
  if (!spelActief) return;
  let index;
  switch (moeilijkheid) {
    case 1:
      index = willekeurigeZet();
      break;
    case 2:
      index = blokkeerOfWillekeurig();
      break;
    case 3:
      index = Math.random() < 0.4 ? willekeurigeZet() : besteZetMinimax();
      break;
    case 4:
      index = Math.random() < 0.15 ? willekeurigeZet() : besteZetMinimax();
      break;
    case 5:
    default:
      index = besteZetMinimax();
      break;
  }

  plaatsZet(index, AI_SPELER);
  const resultaat = controleerWinnaar();
  if (resultaat) {
    verwerkResultaat(resultaat);
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
  naamOEl.textContent = 'Speler 2';
  resetScore();
});

modeAIKnop.addEventListener('click', () => {
  tegenAI = true;
  modeAIKnop.classList.add('actief');
  mode2SpelersKnop.classList.remove('actief');
  aiOptiesEl.style.display = 'flex';
  naamOEl.textContent = 'AI';
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

// ── Vakje-klik events ────────────────────────────────────────
vakjes.forEach(vakje => {
  vakje.addEventListener('click', () => {
    verwerkKlik(Number(vakje.dataset.index));
  });
});

nieuwSpelKnop.addEventListener('click', nieuwSpel);
resetScoreKnop.addEventListener('click', resetScore);

// Start
updateActieveSpeler();
