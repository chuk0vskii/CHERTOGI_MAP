import { CONFIG } from '../config.js';

let hexData = {};
let isSaving = false;
let githubToken = null;

function authenticate() {
  const password = prompt('🔐 Введите пароль администратора:');
  if (password !== CONFIG.ADMIN_PASSWORD) {
    document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50px;">⛔ ДОСТУП ЗАПРЕЩЕН</h1>';
    return false;
  }
  return true;
}

function askForToken() {
  if (githubToken) return githubToken;
  const token = prompt('🔑 Введите GitHub Personal Access Token:');
  if (token) {
    githubToken = token;
    return token;
  }
  return null;
}

async function loadData() {
  try {
    const response = await fetch('../data/map-state.json?t=' + Date.now());
    const data = await response.json();
    hexData = data.hexes;
    renderAdminPanel();
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    document.getElementById('admin-panel').innerHTML = '<p style="color:red;">❌ Ошибка загрузки данных</p>';
  }
}

function renderAdminPanel() {
  const container = document.getElementById('admin-panel');
  container.innerHTML = `
    <h1>🗺️ Управление картой</h1>
    <div class="controls">
      <button class="btn-save" onclick="window.saveAll()">💾 Сохранить все изменения</button>
      <span id="save-status"></span>
      <button onclick="window.clearToken()" style="background:#666;color:white;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-size:14px;">🔑 Сменить токен</button>
    </div>
    <div class="total-info">Всего гексов: ${Object.keys(hexData).length}</div>
    <div id="hex-list"></div>
  `;

  const list = document.getElementById('hex-list');
  const sortedKeys = Object.keys(hexData).sort((a,b)=>parseFloat(a)-parseFloat(b));

  sortedKeys.forEach(hexId => {
    const state = hexData[hexId];
    const card = document.createElement('div');
    card.className = 'admin-hex';
    card.style.borderLeftColor = state.unlocked ? '#4caf50' : '#666';

    const statusSpan = document.createElement('span');
    statusSpan.className = 'status';
    statusSpan.textContent = state.unlocked ? '🔓' : '🔒';

    const idLabel = document.createElement('strong');
    idLabel.textContent = `Гекс ${hexId}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.unlocked;
    checkbox.addEventListener('change', () => {
      state.unlocked = checkbox.checked;
      card.style.borderLeftColor = state.unlocked ? '#4caf50' : '#666';
      statusSpan.textContent = state.unlocked ? '🔓' : '🔒';
    });

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = state.name || '';
    nameInput.placeholder = 'Название';
    nameInput.addEventListener('change', () => { state.name = nameInput.value; });

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.value = state.desc || '';
    descInput.placeholder = 'Описание';
    descInput.addEventListener('change', () => { state.desc = descInput.value; });

    card.append(statusSpan, idLabel, checkbox, nameInput, descInput);
    list.appendChild(card);
  });
}

window.saveAll = async function() {
  if (isSaving) return;
  
  // Запрашиваем токен если его нет
  if (!githubToken) {
    const token = askForToken();
    if (!token) {
      alert('❌ Токен не введен!');
      return;
    }
  }
  
  isSaving = true;
  const status = document.getElementById('save-status');
  status.textContent = '⏳ Сохранение...';
  status.style.color = '#ffa500';

  try {
    const data = { hexes: hexData };
    const json = JSON.stringify(data, null, 2);
    const content = btoa(unescape(encodeURIComponent(json)));
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/data/map-state.json`;
    
    const getResponse = await fetch(url, {
      headers: { 'Authorization': `token ${githubToken}` }
    });
    
    let sha = null;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    const saveResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Обновление карты ${new Date().toLocaleString()}`,
        content: content,
        sha: sha
      })
    });

    if (saveResponse.ok) {
      status.textContent = '✅ Сохранено!';
      status.style.color = '#4caf50';
      setTimeout(() => { status.textContent = ''; }, 3000);
    } else {
      const error = await saveResponse.json();
      if (error.message && error.message.includes('Bad credentials')) {
        throw new Error('Неверный токен! Введите правильный GitHub токен.');
      }
      throw new Error(error.message || 'Ошибка сохранения');
    }
  } catch (error) {
    status.textContent = `❌ ${error.message}`;
    status.style.color = '#f44336';
    console.error(error);
    // Если ошибка с токеном, сбрасываем его
    if (error.message.includes('токен') || error.message.includes('credentials')) {
      githubToken = null;
    }
  }
  isSaving = false;
};

window.clearToken = function() {
  githubToken = null;
  document.getElementById('save-status').textContent = '🔄 Токен сброшен';
  document.getElementById('save-status').style.color = '#ffa500';
  setTimeout(() => { 
    const s = document.getElementById('save-status');
    if (s) s.textContent = '';
  }, 2000);
};

// Запуск
if (authenticate()) {
  loadData();
}
