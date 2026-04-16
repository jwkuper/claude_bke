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

let bord = Array(9).fill(null);
let huidigeSpeler = 'X';
let spelActief = true;
let score = { X: 0, O: 0, gelijk: 0 };

const vakjes = document.querySelectorAll('.vakje');
const berichtEl = document.getElementById('bericht');
const huidigeSpelerEl = document.getElementById('huidige-speler');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreGelijkEl = document.getElementById('score-gelijk');
const spelerXEl = document.getElementById('speler-x');
const spelerOEl = document.getElementById('speler-o');
const nieuwSpelKnop = document.getElementById('nieuw-spel');
const resetScoreKnop = document.getElementById('reset-score');

function updateActieveSpeler() {
  spelerXEl.classList.toggle('actief', huidigeSpeler === 'X');
  spelerOEl.classList.toggle('actief', huidigeSpeler === 'O');
  huidigeSpelerEl.textContent = huidigeSpeler;
  huidigeSpelerEl.style.color = huidigeSpeler === 'X' ? '#64b4ff' : '#ff6b8a';
}

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

function verwerkKlik(index) {
  if (!spelActief || bord[index]) return;

  bord[index] = huidigeSpeler;

  const vakje = vakjes[index];
  vakje.classList.add('bezet', huidigeSpeler.toLowerCase());
  vakje.innerHTML = `<span class="teken">${huidigeSpeler}</span>`;

  const resultaat = controleerWinnaar();

  if (resultaat) {
    spelActief = false;
    if (resultaat.gelijkspel) {
      berichtEl.textContent = 'Gelijkspel!';
      berichtEl.style.color = '#aaa';
      score.gelijk++;
      scoreGelijkEl.textContent = score.gelijk;
    } else {
      const naam = resultaat.winnaar === 'X' ? 'Speler 1' : 'Speler 2';
      berichtEl.textContent = `${naam} (${resultaat.winnaar}) wint!`;
      berichtEl.style.color = '#ffd750';
      resultaat.combo.forEach(i => vakjes[i].classList.add('winnend'));
      score[resultaat.winnaar]++;
      scoreXEl.textContent = score.X;
      scoreOEl.textContent = score.O;
    }
    huidigeSpelerEl.textContent = '-';
  } else {
    huidigeSpeler = huidigeSpeler === 'X' ? 'O' : 'X';
    updateActieveSpeler();
  }
}

function nieuwSpel() {
  bord = Array(9).fill(null);
  huidigeSpeler = 'X';
  spelActief = true;
  berichtEl.textContent = '';
  berichtEl.style.color = '#ffd750';

  vakjes.forEach(vakje => {
    vakje.className = 'vakje';
    vakje.innerHTML = '';
  });

  updateActieveSpeler();
}

function resetScore() {
  score = { X: 0, O: 0, gelijk: 0 };
  scoreXEl.textContent = 0;
  scoreOEl.textContent = 0;
  scoreGelijkEl.textContent = 0;
  nieuwSpel();
}

vakjes.forEach(vakje => {
  vakje.addEventListener('click', () => {
    verwerkKlik(Number(vakje.dataset.index));
  });
});

nieuwSpelKnop.addEventListener('click', nieuwSpel);
resetScoreKnop.addEventListener('click', resetScore);

// Start
updateActieveSpeler();
