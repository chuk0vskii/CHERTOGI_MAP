import { CONFIG } from '../config.js';

let hexData = {};
let zoomLevel = 1;

async function loadMapState() {
  try {
    const response = await fetch('data/map-state.json?t=' + Date.now());
    const data = await response.json();
    hexData = data.hexes;
    renderMap();
  } catch (error) {
    console.error('Ошибка загрузки карты:', error);
    document.getElementById('hex-grid').innerHTML = '<p style="color:red;">⚠️ Не удалось загрузить карту</p>';
  }
}

function renderMap() {
  const grid = document.getElementById('hex-grid');
  grid.innerHTML = '';

  const rows = [
    ['0.1', '0.2', '0', '0.3', '0.4'],
    ['1', '2', '3', '4'],
    ['5', '6', '7', '8'],
    ['9', '10', '11', '12', '13'],
    ['14', '15', '16', '17'],
    ['18', '19', '20', '21'],
    ['22', '23', '24', '25'],
    ['26', '27', '28', '29']
  ];

  rows.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = `row row-${rowIndex + 1}`;
    
    row.forEach(hexId => {
      const hexElement = createHexElement(hexId);
      rowDiv.appendChild(hexElement);
    });
    
    grid.appendChild(rowDiv);
  });

  const total = Object.keys(hexData).length;
  const unlocked = Object.values(hexData).filter(h => h.unlocked).length;
  const p = document.getElementById('progress');
  if (p) p.textContent = `📊 Прогресс: ${unlocked}/${total} (${Math.round(unlocked/total*100)}%)`;
}

function createHexElement(hexId) {
  const hex = document.createElement('div');
  hex.className = 'hex';
  hex.dataset.id = hexId;
  
  const state = hexData[hexId];
  if (!state) {
    hex.textContent = '?';
    hex.style.background = '#333';
    return hex;
  }

  // ===== ИНДИВИДУАЛЬНОЕ СМЕЩЕНИЕ ДЛЯ ГЕКСА "1" =====
  if (hexId === '1') {
    hex.style.marginLeft = '30px';  // Сдвигаем Деревню Ольховка вправо на 30px
  }

  if (state.unlocked) {
    hex.classList.add('unlocked');
  } else {
    hex.classList.add('locked');
  }

  const nameSpan = document.createElement('span');
  nameSpan.className = 'hex-name';
  nameSpan.textContent = state.name || hexId;
  hex.appendChild(nameSpan);

  hex.addEventListener('click', () => showInfo(hexId));
  return hex;
}

function showInfo(hexId) {
  const state = hexData[hexId];
  if (!state) return;
  const modal = document.getElementById('info-modal');
  document.getElementById('hex-name').textContent = state.name || 'Без названия';
  document.getElementById('hex-desc').textContent = state.desc || 'Нет описания';
  document.getElementById('hex-status').textContent = state.unlocked ? '✅ Открыт' : '🔒 Закрыт';
  document.getElementById('hex-status').style.color = state.unlocked ? '#4caf50' : '#f44336';
  modal.style.display = 'block';
}

function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.1, 2);
  document.querySelectorAll('.hex').forEach(el => {
    const size = 120 * zoomLevel;
    el.style.width = size + 'px';
    el.style.height = (size * 0.866) + 'px';
  });
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
  document.querySelectorAll('.hex').forEach(el => {
    const size = 120 * zoomLevel;
    el.style.width = size + 'px';
    el.style.height = (size * 0.866) + 'px';
  });
}

document.querySelector('.close')?.addEventListener('click', () => {
  document.getElementById('info-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('info-modal')) {
    document.getElementById('info-modal').style.display = 'none';
  }
});

document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);

loadMapState();
setInterval(loadMapState, 10000);
