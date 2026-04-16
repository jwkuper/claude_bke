const RIJEN   = 6;
const KOLOMMEN = 7;

// Staat
let bord;         // 2D array [rij][kolom]: null | 1 | 2
let huidigeSpeler;
let spelActief;
let score = { 1: 0, 2: 0, gelijk: 0 };

// DOM
const bordEl       = document.getElementById('bord');
const kolKnoppenEl = document.getElementById('kolom-knoppen');
const berichtEl    = document.getElementById('bericht');
const huidigeEl    = document.getElementById('huidige-speler');
const score1El     = document.getElementById('score-1');
const score2El     = document.getElementById('score-2');
const scoreGelijkEl = document.getElementById('score-gelijk');
const speler1El    = document.getElementById('speler-1');
const speler2El    = document.getElementById('speler-2');
const nieuwSpelKnop = document.getElementById('nieuw-spel');
const resetScoreKnop = document.getElementById('reset-score');

// Bouw het bord op uit DOM-cellen
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
  huidigeEl.textContent = `Speler ${huidigeSpeler}`;
  huidigeEl.style.color = huidigeSpeler === 1
    ? 'var(--color-speler1)'
    : 'var(--color-speler2)';
}

// Geeft de laagste lege rij in een kolom terug, of -1 als vol
function laagsteLegeRij(kolom) {
  for (let r = RIJEN - 1; r >= 0; r--) {
    if (bord[r][kolom] === null) return r;
  }
  return -1;
}

// Controleer of kolom vol is en update de knop
function updateKolomKnoppen() {
  document.querySelectorAll('.kolom-knop').forEach(knop => {
    const k = Number(knop.dataset.col);
    knop.classList.toggle('vol', laagsteLegeRij(k) === -1);
  });
}

function controleerVier(rij, kolom, speler) {
  const richtingen = [
    { dr: 0,  dk: 1  }, // horizontaal
    { dr: 1,  dk: 0  }, // verticaal
    { dr: 1,  dk: 1  }, // diagonaal ↘
    { dr: 1,  dk: -1 }, // diagonaal ↙
  ];

  for (const { dr, dk } of richtingen) {
    const cellen = [[rij, kolom]];

    for (const richting of [1, -1]) {
      let r = rij + dr * richting;
      let k = kolom + dk * richting;
      while (r >= 0 && r < RIJEN && k >= 0 && k < KOLOMMEN && bord[r][k] === speler) {
        cellen.push([r, k]);
        r += dr * richting;
        k += dk * richting;
      }
    }

    if (cellen.length >= 4) return cellen;
  }
  return null;
}

function controleerGelijkspel() {
  return bord[0].every(cel => cel !== null);
}

function verwerkKlik(kolom) {
  if (!spelActief) return;
  const rij = laagsteLegeRij(kolom);
  if (rij === -1) return;

  bord[rij][kolom] = huidigeSpeler;

  const cel = getCel(rij, kolom);
  cel.classList.add(`speler${huidigeSpeler}`);
  const schijf = document.createElement('div');
  schijf.classList.add('schijf');
  cel.appendChild(schijf);

  updateKolomKnoppen();

  const winnendeCellen = controleerVier(rij, kolom, huidigeSpeler);

  if (winnendeCellen) {
    spelActief = false;
    winnendeCellen.forEach(([r, k]) => getCel(r, k).classList.add('winnend'));
    berichtEl.textContent = `Speler ${huidigeSpeler} wint!`;
    score[huidigeSpeler]++;
    score1El.textContent = score[1];
    score2El.textContent = score[2];
    huidigeEl.textContent = '-';
    huidigeEl.style.color = '';
  } else if (controleerGelijkspel()) {
    spelActief = false;
    berichtEl.textContent = 'Gelijkspel!';
    berichtEl.style.color = 'var(--color-muted)';
    score.gelijk++;
    scoreGelijkEl.textContent = score.gelijk;
    huidigeEl.textContent = '-';
  } else {
    huidigeSpeler = huidigeSpeler === 1 ? 2 : 1;
    updateActieveSpeler();
  }
}

function nieuwSpel() {
  bord = Array.from({ length: RIJEN }, () => Array(KOLOMMEN).fill(null));
  huidigeSpeler = 1;
  spelActief = true;
  berichtEl.textContent = '';
  berichtEl.style.color = 'var(--color-accent)';
  bouwBord();
  updateKolomKnoppen();
  updateActieveSpeler();
}

function resetScore() {
  score = { 1: 0, 2: 0, gelijk: 0 };
  score1El.textContent = 0;
  score2El.textContent = 0;
  scoreGelijkEl.textContent = 0;
  nieuwSpel();
}

// Events
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
