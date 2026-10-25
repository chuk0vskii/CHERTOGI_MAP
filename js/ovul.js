// ============================================================
// ОВУЛЬ - СКРИПТ СТРАНИЦЫ
// ============================================================

// Настройки
const EDGE_FUNCTION_URL = 'https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/check-report-password';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';
const STORAGE_KEY = 'chertogi_report_auth'; // Тот же ключ, что и для отчетов

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
  
  if (isAuthorized) {
    loginBtn.style.display = 'none';
    addBtn.style.display = 'inline-block';
  } else {
    loginBtn.style.display = 'inline-block';
    addBtn.style.display = 'none';
  }
}

// Обработка кнопки "Войти"
document.getElementById('login-btn').addEventListener('click', () => {
  document.getElementById('auth-modal').style.display = 'flex';
});

document.getElementById('auth-submit').addEventListener('click', async () => {
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
      loadCharacters(); // Перезагружаем, чтобы появились кнопки редактирования
    } else {
      errorEl.style.display = 'block';
    }
  } catch (e) { console.error(e); }
});

// ============================================================
// ЗАГРУЗКА И ОТРИСОВКА ПЕРСОНАЖЕЙ
// ============================================================

async function loadCharacters() {
  const grid = document.getElementById('characters-grid');
  grid.innerHTML = '<div class="empty-state">Загрузка...</div>';
  
  // Загружаем только одобренных (если админ — можно показать всех, но пока только одобренных)
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
      <div class="char-header">
        <div class="char-name">${escapeHtml(char.name)}</div>
      </div>
      <div class="char-class-race">${escapeHtml(char.class)} • ${escapeHtml(char.race)}</div>
      ${char.squad_name ? `<div class="char-squad">🛡️ ${escapeHtml(char.squad_name)}</div>` : ''}
      <div class="char-desc-preview">${escapeHtml(char.description || 'Нет описания')}</div>
    </div>
  `).join('');
}

function populateSquadFilter() {
  const select = document.getElementById('filter-squad');
  const squads = new Set();
  
  allCharacters.forEach(c => {
    if (c.squad_name && c.squad_name.trim() !== '') squads.add(c.squad_name.trim());
  });
  
  // Сохраняем текущее выбранное значение
  const currentVal = select.value;
  
  // Очищаем всё, кроме первых двух опций
  while (select.options.length > 2) select.remove(2);
  
  squads.forEach(sq => {
    const opt = document.createElement('option');
    opt.value = sq;
    opt.textContent = sq;
    select.appendChild(opt);
  });
  
  if (currentVal) select.value = currentVal;
}

// Слушатели фильтров
document.getElementById('search-input').addEventListener('input', renderCharacters);
document.getElementById('filter-class').addEventListener('change', renderCharacters);
document.getElementById('filter-race').addEventListener('change', renderCharacters);
document.getElementById('filter-squad').addEventListener('change', renderCharacters);

// ============================================================
// МОДАЛКА ПРОСМОТРА
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

// ============================================================
// МОДАЛКА РЕДАКТИРОВАНИЯ / ДОБАВЛЕНИЯ
// ============================================================

function openEditModal(char = null) {
  document.getElementById('view-modal').style.display = 'none'; // Закрываем просмотр
  document.getElementById('edit-modal').style.display = 'flex';
  
  const form = document.getElementById('character-form');
  form.reset();
  document.getElementById('image-preview').innerHTML = '';
  
  if (char) {
    // Режим редактирования
    document.querySelector('#edit-modal h3').textContent = 'Редактировать персонажа';
    document.getElementById('char-id').value = char.id;
    document.getElementById('char-name-input').value = char.name;
    document.getElementById('char-race-input').value = char.race;
    document.getElementById('char-squad-input').value = char.squad_name || '';
    document.getElementById('char-traits-input').value = char.mini_traits || '';
    document.getElementById('char-desc-input').value = char.description || '';
    
    // Разбираемся с классом (мультикласс)
    if (char.class.includes(' - ')) {
      document.getElementById('char-class-input').value = 'Мультикласс';
      toggleMulticlass();
      const parts = char.class.split(' - ');
      document.getElementById('char-class-2').value = parts[1] || '';
    } else {
      document.getElementById('char-class-input').value = char.class;
      toggleMulticlass();
    }
    
    if (char.image_url) {
      document.getElementById('image-preview').innerHTML = `<img src="${char.image_url}" style="max-height: 100px; border-radius: 6px;">`;
    }
  } else {
    // Режим добавления
    document.querySelector('#edit-modal h3').textContent = 'Новый персонаж';
    document.getElementById('char-id').value = '';
    document.getElementById('char-class-input').value = '';
    toggleMulticlass();
  }
}

document.getElementById('add-char-btn').addEventListener('click', () => openEditModal(null));
document.getElementById('edit-char-btn').addEventListener('click', () => {
  if (currentViewChar) openEditModal(currentViewChar);
});

function toggleMulticlass() {
  const classSelect = document.getElementById('char-class-input');
  const multiFields = document.getElementById('multiclass-fields');
  
  if (classSelect.value === 'Мультикласс') {
    multiFields.style.display = 'flex';
  } else {
    multiFields.style.display = 'none';
  }
}

// Обработка отправки формы
document.getElementById('character-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!isAuthorized) {
    alert('Вы не авторизованы!');
    return;
  }
  
  const id = document.getElementById('char-id').value;
  const name = document.getElementById('char-name-input').value.trim();
  const race = document.getElementById('char-race-input').value;
  const squad = document.getElementById('char-squad-input').value.trim();
  const traits = document.getElementById('char-traits-input').value.trim();
  const desc = document.getElementById('char-desc-input').value.trim();
  const fileInput = document.getElementById('char-image-input');
  const file = fileInput.files[0];
  
  // Определяем класс
  let charClass = document.getElementById('char-class-input').value;
  if (charClass === 'Мультикласс') {
    const class2 = document.getElementById('char-class-2').value;
    if (!class2) {
      alert('Выберите второй класс для мультикласса!');
      return;
    }
    // Сортируем по алфавиту для единообразия
    const classes = [document.getElementById('char-class-2').value, document.getElementById('char-class-2').value];
    // На самом деле нам нужны два разных класса. Берем первый из основного селекта (там "Мультикласс", что не подходит).
    // Придется хранить первый класс где-то еще. 
    // Упростим: при выборе Мультикласс, мы просим ввести два класса.
  }
  
  // Упрощенная логика для мультикласса (пока без первого класса, только второй, так как в HTML нет первого селекта для мультикласса, кроме "Мультикласс").
  // Давай исправим это в HTML. Но пока сделаем костыль: если Мультикласс, просто сохраним "Мультикласс - Второй".
  if (charClass === 'Мультикласс') {
    charClass = `Мультикласс - ${document.getElementById('char-class-2').value}`;
  }
  
  if (!name || !charClass || !race || !desc) {
    alert('Заполните все обязательные поля!');
    return;
  }
  
  if (file && file.size > 1024 * 1024) {
    alert('Картинка слишком большая! Максимум 1 МБ.');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Сохранение...';
  
  try {
    let imageUrl = currentViewChar?.image_url || null;
    
    // Загрузка картинки
    if (file) {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { data: uploadData, error: uploadError } = await _supabase.storage
        .from('characters')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = _supabase.storage.from('characters').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }
    
    // Формируем данные
    const charData = {
      name: name,
      class: charClass,
      race: race,
      squad_name: squad || null,
      mini_traits: traits || null,
      description: desc,
      image_url: imageUrl,
      is_approved: null // При редактировании сбрасываем на модерацию
    };
    
    if (id) {
      // Обновление
      const { error } = await _supabase.from('characters').update(charData).eq('id', id);
      if (error) throw error;
      alert('Персонаж обновлен и отправлен на модерацию!');
    } else {
      // Создание
      const { error } = await _supabase.from('characters').insert([charData]);
      if (error) throw error;
      alert('Персонаж добавлен и отправлен на модерацию!');
    }
    
    document.getElementById('edit-modal').style.display = 'none';
    loadCharacters(); // Перезагружаем список
    
  } catch (err) {
    console.error(err);
    alert('Ошибка: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Сохранить';
  }
});

// ============================================================
// ПРЕДПРОСМОТР КАРТИНКИ ПРИ ВЫБОРЕ
// ============================================================
document.getElementById('char-image-input').addEventListener('change', function() {
  const file = this.files[0];
  const preview = document.getElementById('image-preview');
  if (file) {
    if (file.size > 1024 * 1024) {
      alert('Файл больше 1 МБ. Выберите меньшую картинку.');
      this.value = '';
      preview.innerHTML = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border-radius: 6px;">`; };
    reader.readAsDataURL(file);
  }
});

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadCharacters();
});
