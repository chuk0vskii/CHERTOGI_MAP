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

  // ===== 8 СТОЛБЦОВ (33 ГЕКСА) =====
  const columns = [
    ['0.1', '0.2', '0', '0.3', '0.4'],  // Колонка 1 (5)
    ['1', '2', '3', '4'],                // Колонка 2 (4)
    ['5', '6', '7', '8'],                // Колонка 3 (4)
    ['9', '10', '11', '12', '13'],       // Колонка 4 (5)
    ['14', '15', '16', '17'],            // Колонка 5 (4)
    ['18', '19', '20', '21'],            // Колонка 6 (4)
    ['22', '23', '24', '25'],            // Колонка 7 (4)
    ['26', '27', '28', '29']             // Колонка 8 (4) ← ДОБАВЛЕНЫ 28 И 29!
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

  // Прогресс
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

  // Размер с учётом зума (базовый размер 120px)
  const baseSize = 120;
  const size = Math.min(baseSize * zoomLevel, 240);
  hex.style.width = size + 'px';
  hex.style.height = (size * 1.1547) + 'px';  // Правильное соотношение для гекса

  // Цвет и статус
  if (state.unlocked) {
    hex.classList.add('unlocked');
    hex.style.background = `linear-gradient(135deg, #4a7c59, #2d5a3d)`;
    hex.style.borderColor = 'rgba(255,215,0,0.6)';
  } else {
    hex.classList.add('locked');
    hex.style.background = `linear-gradient(135deg, #3d3d3d, #1a1a1a)`;
    hex.style.borderColor = 'rgba(100,100,100,0.3)';
  }

  // Название гекса
  const nameSpan = document.createElement('span');
  nameSpan.className = 'hex-name';
  nameSpan.textContent = state.name || hexId;
  nameSpan.style.fontSize = Math.max(10, 14 * zoomLevel) + 'px';
  hex.appendChild(nameSpan);

  // Клик для информации
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

function zoomIn(){zoomLevel=Math.min(zoomLevel+0.1,2);renderMap();}
function zoomOut(){zoomLevel=Math.max(zoomLevel-0.1,0.5);renderMap();}

// Закрытие модального окна
document.querySelector('.close')?.addEventListener('click', () => {
  document.getElementById('info-modal').style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('info-modal')) {
    document.getElementById('info-modal').style.display = 'none';
  }
});

// Кнопки зума
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);

// Загрузка карты
loadMapState();

// Автообновление каждые 10 секунд
setInterval(loadMapState, 10000);
