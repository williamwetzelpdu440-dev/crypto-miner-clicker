
















let balance = 0;
let totalMined = 0;
let prestigeMultiplier = 1;
let perSecond = 0;

const upgrades = {
  gpu: { count: 0, baseCost: 15, income: 0.1 },
  rig: { count: 0, baseCost: 100, income: 1 },
  asic: { count: 0, baseCost: 500, income: 8 }
};

const balanceEl = document.getElementById('balance');
const perSecondEl = document.getElementById('per-second');
const totalMinedEl = document.getElementById('total-mined');
const mineBtn = document.getElementById('mine-btn');
const prestigeBtn = document.getElementById('prestige-btn');

// Update display
function updateUI() {
  balanceEl.textContent = balance.toFixed(2);
  perSecondEl.textContent = (perSecond * prestigeMultiplier).toFixed(2);
  totalMinedEl.textContent = totalMined.toFixed(2);

  Object.keys(upgrades).forEach(key => {
    const up = upgrades[key];
    const countEl = document.getElementById(`count-${key}`);
    if (countEl) countEl.textContent = up.count;
  });
}

// Mine on click
mineBtn.addEventListener('click', () => {
  const mined = 1 * prestigeMultiplier;
  balance += mined;
  totalMined += mined;
  updateUI();
});

// Buy upgrade
document.querySelectorAll('.upgrade').forEach(el => {
  el.addEventListener('click', () => {
    const name = el.dataset.name.toLowerCase();
    const up = upgrades[name];
    const cost = Math.ceil(up.baseCost * Math.pow(1.15, up.count));

    if (balance >= cost) {
      balance -= cost;
      up.count++;
      perSecond += up.income;
      updateUI();
    } else {
      el.style.animation = 'shake 0.3s';
      setTimeout(() => el.style.animation = '', 300);
    }
  });
});

// Prestige
prestigeBtn.addEventListener('click', () => {
  if (totalMined < 1000) {
    alert("You need at least 1000 BTC total mined to prestige!");
    return;
  }
  if (confirm("Prestige? You will lose all progress but gain a permanent multiplier.")) {
    prestigeMultiplier += 0.5; // +50% each prestige
    // Reset
    balance = 0;
    perSecond = 0;
    Object.values(upgrades).forEach(up => up.count = 0);
    updateUI();
  }
});

// Game loop (passive income)
setInterval(() => {
  if (perSecond > 0) {
    const income = perSecond * prestigeMultiplier * 0.1; // every 100ms
    balance += income;
    totalMined += income;
    updateUI();
  }
}, 100);

// Save & Load (localStorage)
function saveGame() {
  const gameData = {
    balance, totalMined, prestigeMultiplier,
    upgrades
  };
  localStorage.setItem('cryptoMinerSave', JSON.stringify(gameData));
}

function loadGame() {
  const saved = localStorage.getItem('cryptoMinerSave');
  if (saved) {
    const data = JSON.parse(saved);
    balance = data.balance || 0;
    totalMined = data.totalMined || 0;
    prestigeMultiplier = data.prestigeMultiplier || 1;
    Object.assign(upgrades, data.upgrades);
    
    // Recalculate perSecond
    perSecond = 0;
    Object.values(upgrades).forEach(up => {
      perSecond += up.income * up.count;
    });
  }
  updateUI();
}

// Auto save every 10 seconds
setInterval(saveGame, 10000);
window.addEventListener('beforeunload', saveGame);

// Keyboard support (Space to mine)
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    mineBtn.click();
  }
});

loadGame();
updateUI();
