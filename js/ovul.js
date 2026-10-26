// ============================================================
// ОВУЛЬ - СКРИПТ СТРАНИЦЫ
// ============================================================

const EDGE_FUNCTION_URL = 'https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/check-report-password';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';
const STORAGE_KEY = 'chertogi_report_auth';

let isAuthorized = false;
let allCharacters = [];
let currentViewChar = null;
let allResidents = []; 

// ============================================================
// АВТОРИЗАЦИЯ
// ============================================================
function checkAuthStatus() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      isAuthorized = data.isAuthorized || false;
      updateAuthUI();
    }
  } catch (e) { console.warn(e); }
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const addBtn = document.getElementById('add-char-btn');
  if (loginBtn && addBtn) {
    if (isAuthorized) {
      loginBtn.style.display = 'none';
      addBtn.style.display = 'inline-block';
    } else {
      loginBtn.style.display = 'inline-block';
      addBtn.style.display = 'none';
    }
  }
}

// ============================================================
// ЗАГРУЗКА ИСКАТЕЛЕЙ
// ============================================================
async function loadCharacters() {
  const grid = document.getElementById('characters-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="empty-state">Загрузка...</div>';
  let query = _supabase.from('characters').select('*').order('name');
  if (!isAuthorized) query = query.eq('is_approved', true);
  const { data, error } = await query;
  if (error) { grid.innerHTML = '<div class="empty-state">Ошибка загрузки</div>'; return; }
  allCharacters = data || [];
  populateSquadFilter();
  renderCharacters();
}

function renderCharacters() {
  const grid = document.getElementById('characters-grid');
  if (!grid) return;
  const search = document.getElementById('search-input').value.toLowerCase();
  const filterClass = document.getElementById('filter-class').value;
  const filterRace = document.getElementById('filter-race').value;
  const filterSquad = document.getElementById('filter-squad').value;
  
  const filtered = allCharacters.filter(char => {
    const matchesSearch = (char.name || '').toLowerCase().includes(search) || (char.description || '').toLowerCase().includes(search);
    const matchesClass = filterClass ? (char.class || '').includes(filterClass) : true;
    const matchesRace = filterRace ? char.race === filterRace : true;
    const matchesSquad = filterSquad ? (char.squad_name || 'Без отряда') === filterSquad : true;
    return matchesSearch && matchesClass && matchesRace && matchesSquad;
  });
  
  if (filtered.length === 0) { grid.innerHTML = '<div class="empty-state">Искатели не найдены</div>'; return; }
  
  grid.innerHTML = filtered.map(char => `
    <div class="character-card" onclick="openViewModal(${char.id})">
      ${char.image_url ? `<img src="${char.image_url}" class="char-thumbnail" alt="${escapeHtml(char.name)}">` : `<div class="char-thumbnail" style="display:flex; align-items:center; justify-content:center; color:#555; font-size:20px;">?</div>`}
      <div class="char-info-wrapper">
        <div class="char-name">${escapeHtml(char.name)}</div>
        <div class="char-class-race">${escapeHtml(char.class)} • ${escapeHtml(char.race)}</div>
        ${char.squad_name ? `<div class="char-class-race" style="color: #51cf66;">🛡️ ${escapeHtml(char.squad_name)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function populateSquadFilter() {
  const select = document.getElementById('filter-squad');
  if (!select) return;
  const squads = new Set();
  allCharacters.forEach(c => { if (c.squad_name && c.squad_name.trim() !== '') squads.add(c.squad_name.trim()); });
  const currentVal = select.value;
  while (select.options.length > 2) select.remove(2);
  squads.forEach(sq => { const opt = document.createElement('option'); opt.value = sq; opt.textContent = sq; select.appendChild(opt); });
  if (currentVal) select.value = currentVal;
}

// ============================================================
// ЗАГРУЗКА ЖИТЕЛЕЙ И ПАТРОНОВ
// ============================================================
async function loadResidents() {
  const grid = document.getElementById('residents-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="empty-state">Загрузка...</div>';
  const { data, error } = await _supabase.from('ovul_residents').select('*').order('name');
  if (error) { grid.innerHTML = '<div class="empty-state">Ошибка загрузки жителей</div>'; return; }
  allResidents = data || [];
  renderResidents();
}

function renderResidents() {
  const grid = document.getElementById('residents-grid');
  if (!grid) return;
  const search = document.getElementById('search-resident-input').value.toLowerCase();
  const filtered = allResidents.filter(res => (res.name || '').toLowerCase().includes(search));

  if (filtered.length === 0) { grid.innerHTML = '<div class="empty-state">Жители не найдены</div>'; return; }

  grid.innerHTML = filtered.map(res => {
    let iconName = res.icon ? String(res.icon) : '';
    const iconSrc = iconName ? `/CHERTOGI_MAP/images/ovul/${iconName}.png` : '/CHERTOGI_MAP/icons/marker2.png';
    
    // Проверяем, патрон это или житель
    const roleLabel = res.is_patron ? 'Патрон Овуля' : 'Житель Овуля';
    const roleColor = res.is_patron ? '#ff6b6b' : '#aaa'; // Патроны будут красноватыми

    return `
      <div class="character-card resident-card" onclick="openResidentModal(${res.id})">
        <img src="${iconSrc}" class="resident-icon" alt="${escapeHtml(res.name)}" onerror="this.src='/CHERTOGI_MAP/icons/marker2.png'">
        <div class="char-info-wrapper">
          <div class="char-name">${escapeHtml(res.name)}</div>
          <div class="char-class-race" style="color: ${roleColor};">${roleLabel}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// МОДАЛЬНЫЕ ОКНА
// ============================================================
function openViewModal(id) {
  const char = allCharacters.find(c => c.id === id);
  if (!char) return;
  currentViewChar = char;
  document.getElementById('view-name').textContent = char.name;
  document.getElementById('view-class-race').textContent = `${char.class} • ${char.race}`;
  document.getElementById('view-squad').textContent = char.squad_name ? `🛡️ Отряд: ${char.squad_name}` : '';
  document.getElementById('view-desc').textContent = char.description || 'Описание отсутствует';
  document.getElementById('view-traits').textContent = char.mini_traits ? `✦ Достижения: ${char.mini_traits}` : '';
  const img = document.getElementById('view-image');
  if (char.image_url) { img.src = char.image_url; img.style.display = 'block'; } else { img.style.display = 'none'; }
  const editBtn = document.getElementById('edit-char-btn');
  if (isAuthorized) { editBtn.style.display = 'inline-block'; editBtn.onclick = () => openEditModal(char); } else { editBtn.style.display = 'none'; }
  document.getElementById('view-modal').style.display = 'flex';
}

function openResidentModal(id) {
  const res = allResidents.find(r => r.id === id);
  if (!res) return;

  document.getElementById('res-view-name').textContent = res.name;
  
  // Вывод описания с абзацами
  const descEl = document.getElementById('res-view-desc');
  const rawDesc = res.description || '';
  
  if (rawDesc) {
    const formattedDesc = rawDesc.split('\n').filter(p => p.trim() !== '').map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
    descEl.innerHTML = formattedDesc;
  } else {
    descEl.innerHTML = '<p>Описание отсутствует</p>';
  }

  // Иконка
  let iconName = res.icon ? String(res.icon) : '';
  const iconSrc = iconName ? `/CHERTOGI_MAP/images/ovul/${iconName}.png` : '/CHERTOGI_MAP/icons/marker2.png';
  const iconImg = document.getElementById('res-view-icon');
  iconImg.src = iconSrc;
  iconImg.onerror = () => { iconImg.src = '/CHERTOGI_MAP/icons/marker2.png'; };

  // Награда (Мини-черта)
  const rewardWrapper = document.getElementById('res-view-reward-wrapper');
  if (res.reward) {
    document.getElementById('res-view-reward').textContent = res.reward;
    rewardWrapper.style.display = 'block';
  } else {
    rewardWrapper.style.display = 'none';
  }

  // Тайна
  const secretWrapper = document.getElementById('res-view-secret-wrapper');
  if (res.secret) {
    document.getElementById('res-view-secret').textContent = res.secret;
    secretWrapper.style.display = 'block';
  } else {
    secretWrapper.style.display = 'none';
  }

  document.getElementById('resident-modal').style.display = 'flex';
}

// ... остальные функции для искателей (openEditModal, toggleMulticlass и т.д.) остаются без изменений ...
