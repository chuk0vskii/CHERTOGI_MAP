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

  // ===== ТОЛЬКО 2 ГЕКСА =====
  const columns = [
    ['0.1'],  // Столбец 1 (1 гекс)
    ['1']     // Столбец 2 (1 гекс)
  ];

  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'columns-container';

  columns.forEach((column, colIndex) => {
    const colDiv = document.createElement('div');
    colDiv.className = `column column-${colIndex + 1}`;
    
    column.forEach(hexId => {
      const hexElement = createHexElement(hexId);
      colDiv.appendChild(hexElement);
    });
    
    columnsContainer.appendChild(colDiv);
  });

  grid.appendChild(columnsContainer);

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
