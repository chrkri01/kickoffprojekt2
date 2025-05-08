'use strict';

// Tema-knapper
const btnDark = document.querySelector('#btn-dark');
const btnLight = document.querySelector('#btn-light');
const storyContainer = document.getElementById('story-container');

const setTheme = (mode) => {
  const isLight = mode === 'light';
  document.body.classList.toggle('dark-mode', !isLight);
  document.body.classList.toggle('light-mode', isLight);
  localStorage.setItem('theme', mode);
};

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  if (btnDark && btnLight) {
    btnDark.addEventListener('click', () => setTheme('dark'));
    btnLight.addEventListener('click', () => setTheme('light'));
  }

  // Start intro
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('intro-screen').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
      renderScene('network');
    });
  }
});

// Variabler 
let networkType = '';
let usedVPN = false;
let clickedPopup = false;
let choicesSummary = [];


const scenes = [
  {
    id: 'network',
    text: 'Du sidder på caféen og skal vælge et netværk:',
    options: [
      {
        text: 'Gratis Café WiFi',
        value: 'open',
        feedback: 'Usikkert netværk. Data kan opsnappes.',
        next: 'vpn'
      },
      {
        text: 'Café Gæst (med kode)',
        value: 'secure',
        feedback: 'Relativt sikkert netværk.',
        next: 'vpn'
      },
      {
        text: 'Eget mobil hotspot',
        value: 'hotspot',
        feedback: 'Sikkert valg – din egen forbindelse.',
        next: 'vpn'
      }
    ],
    onSelect: (value) => { networkType = value; }
  },
  {
    id: 'vpn',
    text: 'Vil du aktivere din VPN før du går online?',
    options: [
      {
        text: 'Brug VPN',
        value: true,
        feedback: 'Godt valg – dine data er krypteret.',
        next: 'popup'
      },
      {
        text: 'Ingen VPN',
        value: false,
        feedback: () => networkType === 'hotspot'
          ? 'OK valg – din forbindelse er allerede sikker.'
          : 'Risikabelt valg på offentligt netværk.',
        next: 'popup'
      }
    ],
    onSelect: (value) => { usedVPN = value; }
  },
  {
    id: 'popup',
    text: 'En pop-up siger: "Din computer er inficeret! Klik her for at rense den."',
    options: [
      {
        text: 'Klik på pop-up',
        value: true,
        feedback: 'Du installerede malware!',
        next: 'summary'
      },
      {
        text: 'Ignorer og scan selv',
        value: false,
        feedback: 'Godt valg – du undgik malware.',
        next: 'summary'
      }
    ],
    onSelect: (value) => { clickedPopup = value; }
  }
];


function renderScene(sceneId) {
  const scene = scenes.find(s => s.id === sceneId);
  storyContainer.innerHTML = `<p>${scene.text}</p><div class="choices"></div>`;
  const choicesDiv = storyContainer.querySelector('.choices');

  scene.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      const feedbackText = typeof opt.feedback === 'function' ? opt.feedback() : opt.feedback;
      choicesSummary.push({
        category: scene.id,
        choice: opt.text,
        feedback: feedbackText
      });
      scene.onSelect(opt.value);
      if (opt.next === 'summary') {
        showSummary();
      } else {
        renderScene(opt.next);
      }
    });
    choicesDiv.appendChild(btn);
  });
  saveChoices();
}


function showSummary() {
  let summaryHtml = '<h2>Opsummering</h2><ul>';
  choicesSummary.forEach(c => {
    summaryHtml += `<li><strong>${c.category}:</strong> ${c.choice} – ${c.feedback}</li>`;
  });
  summaryHtml += '</ul>';

  let result = '';
  if (networkType === 'open' && !usedVPN && clickedPopup) {
    result = 'Du blev hacket og fik malware – alvorlige konsekvenser.';
  } else if (clickedPopup || (!usedVPN && networkType !== 'hotspot')) {
    result = 'Du oplevede problemer pga. et usikkert valg.';
  } else {
    result = 'Alt gik godt – du var cybersikker!';
  }

  summaryHtml += `<p><strong>Resultat:</strong> ${result}</p>`;
  summaryHtml += `<button id="restart">🔄 Start forfra</button>`;
  storyContainer.innerHTML = summaryHtml;

  document.getElementById('restart').onclick = () => {
    localStorage.removeItem('choices');
    choicesSummary = [];
    renderScene('network');
  };
}

function saveChoices() {
  localStorage.setItem('choices', JSON.stringify(choicesSummary));
}
