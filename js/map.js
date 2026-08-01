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
  grid.style.position = 'relative';
  grid.style.width = '1400px';
  grid.style.height = '1400px';

  // ===== КООРДИНАТЫ ГЕКСОВ (X, Y) =====
  // Формат: [id, row, col] - row=номер ряда (0-7), col=позиция в ряду
  const hexPositions = [
    // Ряд 1 (5 гексов)
    { id: '0.1', x: 0, y: 0 },
    { id: '0.2', x: 90, y: 0 },
    { id: '0', x: 180, y: 0 },
    { id: '0.3', x: 270, y: 0 },
    { id: '0.4', x: 360, y: 0 },
    // Ряд 2 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '1', x: 0, y: 52 },
    { id: '2', x: 90, y: 52 },
    { id: '3', x: 180, y: 52 },
    { id: '4', x: 270, y: 52 },
    // Ряд 3 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '5', x: 0, y: 104 },
    { id: '6', x: 90, y: 104 },
    { id: '7', x: 180, y: 104 },
    { id: '8', x: 270, y: 104 },
    // Ряд 4 (5 гексов)
    { id: '9', x: 0, y: 156 },
    { id: '10', x: 90, y: 156 },
    { id: '11', x: 180, y: 156 },
    { id: '12', x: 270, y: 156 },
    { id: '13', x: 360, y: 156 },
    // Ряд 5 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '14', x: 0, y: 208 },
    { id: '15', x: 90, y: 208 },
    { id: '16', x: 180, y: 208 },
    { id: '17', x: 270, y: 208 },
    // Ряд 6 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '18', x: 0, y: 260 },
    { id: '19', x: 90, y: 260 },
    { id: '20', x: 180, y: 260 },
    { id: '21', x: 270, y: 260 },
    // Ряд 7 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '22', x: 0, y: 312 },
    { id: '23', x: 90, y: 312 },
    { id: '24', x: 180, y: 312 },
    { id: '25', x: 270, y: 312 },
    // Ряд 8 (4 гекса) - сдвиг вниз на 52px, влево на 30px
    { id: '26', x: 0, y: 364 },
    { id: '27', x: 90, y: 364 },
    { id: '28', x: 180, y: 364 },
    { id: '29', x: 270, y: 364 }
  ];

  hexPositions.forEach(pos => {
    const hexElement = createHexElement(pos.id);
    hexElement.style.position = 'absolute';
    hexElement.style.left = pos.x + 'px';
    hexElement.style.top = pos.y + 'px';
    hexElement.style.margin = '0';
    grid.appendChild(hexElement);
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
