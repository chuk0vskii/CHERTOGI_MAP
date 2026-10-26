// ============================================================
// ОВУЛЬ - СКРИПТ СТРАНИЦЫ
// ============================================================

const EDGE_FUNCTION_URL = 'https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/check-report-password';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';
const STORAGE_KEY = 'chertogi_report_auth';

let isAuthorized = false;
let allCharacters = [];
let currentViewChar = null;

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
// ЗАГРУЗКА И ОТРИСОВКА ПЕРСОНАЖЕЙ
// ============================================================

async function loadCharacters() {
  const grid = document.getElementById('characters-grid');
  if (!grid) return;
  
  grid.innerHTML = '<div class="empty-state">Загрузка...</div>';
  
  let query = _supabase.from('characters').select('*').order('name');
  
  if (!isAuthorized) {
    query = query.eq('is_approved', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(error);
    grid.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
    return;
  }
  
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
    const matchesSearch = (char.name || '').toLowerCase().includes(search) || 
                          (char.description || '').toLowerCase().includes(search);
    const matchesClass = filterClass ? (char.class || '').includes(filterClass) : true;
    const matchesRace = filterRace ? char.race === filterRace : true;
    const matchesSquad = filterSquad ? (char.squad_name || 'Без отряда') === filterSquad : true;
    
    return matchesSearch && matchesClass && matchesRace && matchesSquad;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Персонажи не найдены</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(char => `
    <div class="character-card" onclick="openViewModal(${char.id})">
      ${char.image_url 
        ? `<img src="${char.image_url}" class="char-thumbnail" alt="${escapeHtml(char.name)}">` 
        : `<div class="char-thumbnail" style="display:flex; align-items:center; justify-content:center; color:#555; font-size:20px;">?</div>`
      }
      <div class="char-info-wrapper">
        <div class="char-name">${escapeHtml(char.name)}</div>
        <div class="char-class-race">${escapeHtml(char.class)} • ${escapeHtml(char.race)}</div>
        ${char.squad_name ? `<div class="char-squad">🛡️ ${escapeHtml(char.squad_name)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function populateSquadFilter() {
  const select = document.getElementById('filter-squad');
  if (!select) return;
  const squads = new Set();
  
  allCharacters.forEach(c => {
    if (c.squad_name && c.squad_name.trim() !== '') squads.add(c.squad_name.trim());
  });
  
  const currentVal = select.value;
  while (select.options.length > 2) select.remove(2);
  
  squads.forEach(sq => {
    const opt = document.createElement('option');
    opt.value = sq;
    opt.textContent = sq;
    select.appendChild(opt);
  });
  
  if (currentVal) select.value = currentVal;
}

// ============================================================
// МОДАЛКИ ПЕРСОНАЖЕЙ
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
  if (char.image_url) {
    img.src = char.image_url;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }
  
  const editBtn = document.getElementById('edit-char-btn');
  if (isAuthorized) {
    editBtn.style.display = 'inline-block';
    editBtn.onclick = () => openEditModal(char);
  } else {
    editBtn.style.display = 'none';
  }
  
  document.getElementById('view-modal').style.display = 'flex';
}

function openEditModal(char = null) {
  document.getElementById('view-modal').style.display = 'none'; 
  document.getElementById('edit-modal').style.display = 'flex';
  
  const form = document.getElementById('character-form');
  form.reset();
  document.getElementById('image-preview').innerHTML = '';
  
  if (char) {
    document.querySelector('#edit-modal h3').textContent = 'Редактировать персонажа';
    document.getElementById('char-id').value = char.id;
    document.getElementById('char-name-input').value = char.name;
    document.getElementById('char-race-input').value = char.race;
    document.getElementById('char-squad-input').value = char.squad_name || '';
    document.getElementById('char-traits-input').value = char.mini_traits || '';
    document.getElementById('char-desc-input').value = char.description || '';
    
    if (char.class.includes(' - ')) {
      document.getElementById('char-class-input').value = 'Мультикласс';
      toggleMulticlass();
      const parts = char.class.split(' - ');
      document.getElementById('char-class-multi-1').value = parts[0] || '';
      document.getElementById('char-class-multi-2').value = parts[1] || '';
    } else {
      document.getElementById('char-class-input').value = char.class;
      toggleMulticlass();
    }
    
    if (char.image_url) {
      document.getElementById('image-preview').innerHTML = `<img src="${char.image_url}" style="max-height: 100px; border-radius: 6px;">`;
    }
  } else {
    document.querySelector('#edit-modal h3').textContent = 'Новый персонаж';
    document.getElementById('char-id').value = '';
    document.getElementById('char-class-input').value = '';
    toggleMulticlass();
  }
}

function toggleMulticlass() {
  const classSelect = document.getElementById('char-class-input');
  const multiFields = document.getElementById('multiclass-fields');
  
  if (classSelect && multiFields) {
    if (classSelect.value === 'Мультикласс') {
      multiFields.style.display = 'flex';
    } else {
      multiFields.style.display = 'none';
      document.getElementById('char-class-multi-1').value = '';
      document.getElementById('char-class-multi-2').value = '';
    }
  }
}

// ============================================================
// ЖИТЕЛИ ОВУЛЯ (МЕТКИ НА КАРТЕ) - ИСПРАВЛЕНО
// ============================================================

async function loadOvulMarkers() {
  const mapImg = document.getElementById('ovul-map-image');
  const scene = document.getElementById('ovul-map-scene');
  if (!mapImg || !scene) return;

  // Ждем загрузки картинки
  if (!mapImg.complete || mapImg.naturalWidth === 0) {
    await new Promise(resolve => {
      mapImg.onload = resolve;
      mapImg.onerror = resolve;
    });
  }

  const { data, error } = await _supabase.from('ovul_residents').select('*');
  if (error) {
    console.error('Ошибка загрузки меток:', error);
    return;
  }
  if (!data || data.length === 0) return;

  let markersLayer = document.getElementById('ovul-markers-layer');
  if (!markersLayer) {
    markersLayer = document.createElement('div');
    markersLayer.id = 'ovul-markers-layer';
    markersLayer.className = 'map-markers-layer';
    scene.appendChild(markersLayer);
  }
  markersLayer.innerHTML = '';

  data.forEach(resident => {
    if (resident.pos_x === null || resident.pos_y === null) return;

    const marker = document.createElement('div');
    marker.className = 'ovul-marker';
    // Задаем только позицию в процентах. Размер и отступы берет из CSS!
    marker.style.left = resident.pos_x + '%';
    marker.style.top = resident.pos_y + '%';

    if (resident.icon === 'drevo') {
      marker.classList.add('marker-drevo');
    }

    // Жестко нижний регистр для надежности
    let iconName = resident.icon ? String(resident.icon).toLowerCase() : '';
    const iconSrc = iconName
      ? `/CHERTOGI_MAP/images/ovul/${iconName}.png`
      : '/CHERTOGI_MAP/icons/marker2.png';

    marker.innerHTML = `
      <img src="${iconSrc}" alt="${escapeHtml(resident.name)}" onerror="this.src='/CHERTOGI_MAP/icons/marker2.png'">
      <div class="marker-tooltip">${escapeHtml(resident.name)}</div>
    `;

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      if (iconName === 'drevo') {
        window.location.href = 'tree.html';
      } else {
        showResidentInfo(resident);
      }
    });

    markersLayer.appendChild(marker);
  });
}

function showResidentInfo(resident) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2 style="font-family: 'Calypso', serif; color: #ffd700; margin-bottom: 15px;">${escapeHtml(resident.name)}</h2>
      
      <div style="font-size: 15px; line-height: 1.6; color: #e0d5c0; white-space: pre-line; margin-bottom: 20px;">
        ${escapeHtml(resident.description)}
      </div>

      ${resident.reward ? `
        <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #ffd700; margin-bottom: 15px;">
          <div style="color: #ffd700; font-weight: bold; margin-bottom: 5px;">🏆 Награда (Мини-черта):</div>
          <div style="color: #e0d5c0; font-size: 14px;">${escapeHtml(resident.reward)}</div>
        </div>
      ` : ''}

      ${resident.secret ? `
        <div style="background: rgba(255,50,50,0.05); padding: 15px; border-radius: 8px; border-left: 3px solid #ff4444;">
          <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 5px;">🤫 Тайна:</div>
          <div style="color: #ccc; font-size: 14px;">${escapeHtml(resident.secret)}</div>
        </div>
      ` : ''}
    </div>
  `;
  document.body.appendChild(modal);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ И СОБЫТИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadCharacters();
  
  // Загружаем метки, когда страница готова
  loadOvulMarkers();

  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      document.getElementById('auth-modal').style.display = 'flex';
    });
  }

  const addBtn = document.getElementById('add-char-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openEditModal(null));
  }

  const editBtn = document.getElementById('edit-char-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (currentViewChar) openEditModal(currentViewChar);
    });
  }

  // Форма
  const form = document.getElementById('character-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!isAuthorized) { alert('Вы не авторизованы!'); return; }
      
      const id = document.getElementById('char-id').value;
      const name = document.getElementById('char-name-input').value.trim();
      const race = document.getElementById('char-race-input').value;
      const squad = document.getElementById('char-squad-input').value.trim();
      const traits = document.getElementById('char-traits-input').value.trim();
      const desc = document.getElementById('char-desc-input').value.trim();
      const fileInput = document.getElementById('char-image-input');
      const file = fileInput.files[0];
      
      let charClass = document.getElementById('char-class-input').value;
      if (charClass === 'Мультикласс') {
        const class1 = document.getElementById('char-class-multi-1').value;
        const class2 = document.getElementById('char-class-multi-2').value;
        if (!class1 || !class2) { alert('Выберите оба класса!'); return; }
        charClass = `${class1} - ${class2}`;
      }
      
      if (!name || !charClass || !race || !desc) { alert('Заполните все обязательные поля!'); return; }
      if (file && file.size > 1024 * 1024) { alert('Картинка слишком большая! Максимум 1 МБ.'); return; }
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Сохранение...';
      
      try {
        let imageUrl = currentViewChar?.image_url || null;
        if (file) {
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { error: uploadError } = await _supabase.storage.from('characters').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: urlData } = _supabase.storage.from('characters').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
        
        const charData = {
          name: name,
          class: charClass,
          race: race,
          squad_name: squad || null,
          mini_traits: traits || null,
          description: desc,
          image_url: imageUrl,
          is_approved: null
        };
        
        if (id) {
          const { error } = await _supabase.from('characters').update(charData).eq('id', id);
          if (error) throw error;
          alert('Персонаж обновлен и отправлен на модерацию!');
        } else {
          const { error } = await _supabase.from('characters').insert([charData]);
          if (error) throw error;
          alert('Персонаж добавлен и отправлен на модерацию!');
        }
        
        document.getElementById('edit-modal').style.display = 'none';
        loadCharacters(); 
      } catch (err) {
        console.error(err);
        alert('Ошибка: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Сохранить';
      }
    });
  }

  // Вход по паролю
  const authSubmit = document.getElementById('auth-submit');
  if (authSubmit) {
    authSubmit.addEventListener('click', async () => {
      const pwd = document.getElementById('auth-password').value;
      const errorEl = document.getElementById('auth-error');
      if (!pwd) return;
      
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_PUBLIC_KEY },
          body: JSON.stringify({ password: pwd })
        });
        const data = await response.json();
        if (data.ok) {
          isAuthorized = true;
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthorized: true, currentKeeper: 'Админ' }));
          document.getElementById('auth-modal').style.display = 'none';
          errorEl.style.display = 'none';
          updateAuthUI();
          loadCharacters();
        } else {
          errorEl.style.display = 'block';
        }
      } catch (e) { console.error(e); }
    });
  }

  // Фильтры
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', renderCharacters);
  const filterClass = document.getElementById('filter-class');
  if (filterClass) filterClass.addEventListener('change', renderCharacters);
  const filterRace = document.getElementById('filter-race');
  if (filterRace) filterRace.addEventListener('change', renderCharacters);
  const filterSquad = document.getElementById('filter-squad');
  if (filterSquad) filterSquad.addEventListener('change', renderCharacters);

  // Превью картинки
  const imageInput = document.getElementById('char-image-input');
  if (imageInput) {
    imageInput.addEventListener('change', function() {
      const file = this.files[0];
      const preview = document.getElementById('image-preview');
      if (file) {
        if (file.size > 1024 * 1024) {
          alert('Файл больше 1 МБ.');
          this.value = ''; preview.innerHTML = ''; return;
        }
        const reader = new FileReader();
        reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border-radius: 6px;">`; };
        reader.readAsDataURL(file);
      }
    });
  }
});
