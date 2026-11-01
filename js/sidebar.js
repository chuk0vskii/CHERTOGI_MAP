// ===================== БОКОВАЯ ПАНЕЛЬ =====================
let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');
const difficultyContainer = document.getElementById('region-difficulty');

// ===================== АВТОРИЗАЦИЯ =====================
const STORAGE_KEY = 'chertogi_report_auth';
const EDGE_FUNCTION_URL = 'https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/check-report-password';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';
let isAuthorized = false, currentKeeper = '';

// ===================== РАЗМЕЩЕНИЕ МЕТОК =====================
let placementMode = null;
let tempMarkers = { resource: null, shelter: null };
let mapClickListener = null;
let activePlacementType = null;

// ===================== СТИЛИ =====================
(function injectStyles() {
  if (document.getElementById('sidebar-styles')) return;
  const s = document.createElement('style');
  s.id = 'sidebar-styles';
  s.textContent = `
.region-img-container{display:flex;align-items:center;justify-content:center;overflow:hidden;background:#4a0e0e;position:relative;width:100%;min-height:150px;max-height:350px;height:auto;padding:0}
.region-img{width:100%;height:100%;object-fit:contain;max-height:350px;min-height:150px;background:#4a0e0e}
.region-img-placeholder{color:rgba(255,255,255,.3);font-size:14px;font-family:Philosopher,sans-serif;display:flex;align-items:center;justify-content:center;width:100%;min-height:150px}
.difficulty-row{display:flex;align-items:center;gap:10px;margin:12px 0 16px;padding:8px 12px;background:rgba(74,14,14,.4);border-radius:6px;border-left:3px solid #4a0e0e}
.difficulty-label{color:#aaa;font-size:14px;font-family:Philosopher,sans-serif}
.difficulty-value{color:#ffd700;font-size:18px;font-weight:700;font-family:Philosopher,sans-serif}
.report-section{margin-top:20px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px}
.report-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.report-title{color:#ffd700;font-family:Calypso,serif;font-size:18px;letter-spacing:1px}
.btn-mini{background:transparent;border:1px solid rgba(255,215,0,.2);color:#ffd700;padding:2px 12px;border-radius:4px;cursor:pointer;font-family:Philosopher,sans-serif;font-size:12px}
.field{margin-bottom:10px}
.field label{font-size:13px;color:rgba(255,255,255,.5);display:block;margin-bottom:4px}
.field-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.field input[type=text],.field textarea{width:100%;padding:8px 12px;background:rgba(255,255,255,.05);border:1px solid #4a0e0e;border-radius:6px;color:#fff;font-family:Philosopher,sans-serif;box-sizing:border-box;font-size:14px}
.field textarea{min-height:60px;resize:vertical}
#keeper-display{color:#ffd700}
.deceased-field{display:flex;gap:8px;margin-bottom:8px;align-items:center}
.deceased-name{flex:1;padding:8px 12px;background:rgba(255,255,255,.05);border:1px solid #4a0e0e;border-radius:6px;color:#fff;font-family:Philosopher,sans-serif;box-sizing:border-box;font-size:14px}
.remove-deceased-btn{background:transparent;border:none;color:#ff6b6b;cursor:pointer;font-size:18px;padding:0 8px}
.checks{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:6px}
.checks label{font-size:14px;color:#e0d5c0;cursor:pointer;display:flex;align-items:center;gap:6px}
.checks input{width:18px;height:18px;accent-color:#ffd700;cursor:pointer}
.hint-yellow,.hint-green{margin-top:8px;padding:8px 12px;border-radius:6px;font-size:13px}
.hint-yellow{background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);color:#ffd700}
.hint-green{background:rgba(81,207,102,.1);border:1px solid rgba(81,207,102,.2);color:#51cf66}
.marker-status{margin-top:8px;font-size:13px;color:rgba(255,255,255,.3)}
.marker-status span+span{margin-left:16px}
.btn-primary{width:100%;padding:10px;background:#4a0e0e;color:#ffd700;border:none;border-radius:6px;cursor:pointer;font-family:Philosopher,sans-serif;font-weight:bold;transition:all .3s}
.btn-change-keeper{width:100%;padding:6px;margin-top:6px;background:rgba(74,14,14,.3);border:1px solid rgba(74,14,14,.3);border-radius:4px;color:rgba(255,255,255,.5);cursor:pointer;font-family:Philosopher,sans-serif;font-size:12px;transition:all .3s}
.btn-change-keeper:hover{background:rgba(74,14,14,.6);color:#fff}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:2000;justify-content:center;align-items:center}
.modal-box{background:#1a0a1a;border:1px solid #4a0e0e;border-radius:12px;padding:30px;max-width:400px;width:90%;color:#fff;box-shadow:0 8px 40px rgba(0,0,0,.8)}
.modal-title{font-family:Calypso,serif;color:#ffd700;text-align:center;margin:0 0 10px;font-weight:400;letter-spacing:2px}
.modal-sub{text-align:center;color:rgba(255,255,255,.4);font-size:13px;margin-bottom:16px}
.modal-input{width:100%;padding:10px;margin-bottom:12px;background:rgba(255,255,255,.05);border:1px solid #4a0e0e;border-radius:6px;color:#fff;font-family:Philosopher,sans-serif;box-sizing:border-box;font-size:16px}
.modal-actions{display:flex;gap:10px}
.modal-actions .btn-primary{flex:1;padding:10px}
.btn-cancel{padding:10px 20px;background:transparent;color:#888;border:1px solid #555;border-radius:6px;cursor:pointer;font-family:Philosopher,sans-serif}
.modal-error{color:#ff6b6b;font-size:13px;text-align:center;margin-top:8px;display:none}
`;
  document.head.appendChild(s);
})();

// ===================== ПРОВЕРКА ПАРОЛЯ =====================
async function checkPasswordViaServer(password) {
  try {
    const r = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLIC_KEY },
      body: JSON.stringify({ password })
    });
    if (!r.ok) { console.error('Ошибка запроса:', r.status); return false; }
    return (await r.json()).ok === true;
  } catch (e) { console.error('Ошибка проверки пароля:', e); return false; }
}

// ===================== СОСТОЯНИЕ =====================
function loadAuthState() {
  try {
    const s = sessionStorage.getItem(STORAGE_KEY);
    if (s) { const d = JSON.parse(s); isAuthorized = d.isAuthorized || false; currentKeeper = d.currentKeeper || ''; return true; }
  } catch (e) { console.warn('Ошибка загрузки:', e); }
  return false;
}
function saveAuthState() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthorized, currentKeeper })); }
  catch (e) { console.warn('Ошибка сохранения:', e); }
}
function isReportAuthorized() { return isAuthorized; }
function setReportAuthorized(v) { isAuthorized = v; saveAuthState(); }
function getCurrentKeeper() { return currentKeeper; }
function setCurrentKeeper(n) { currentKeeper = n; saveAuthState(); }

function addDeceasedField() {
  const c = document.getElementById('deceased-container');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'deceased-field';
  d.innerHTML = `<input type="text" class="deceased-name" placeholder="Имя умершего персонажа..."><button class="remove-deceased-btn">X</button>`;
  d.querySelector('.remove-deceased-btn').onclick = () => d.remove();
  c.appendChild(d);
}

// ===================== ИЗОБРАЖЕНИЕ РЕГИОНА =====================
function getRegionImagePath(id) {
  const m = { 0:0, 1:2, 2:1, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 };
  return '/CHERTOGI_MAP/images/' + (m[id] !== undefined ? m[id] : id);
}

function loadRegionImage(regionId) {
  const c = document.getElementById('region-image-placeholder');
  if (!c) return;
  c.innerHTML = '';
  c.className = 'region-img-container';
  const base = getRegionImagePath(regionId), exts = ['.png', '.jpg', '.jpeg', '.webp'];
  let i = 0;
  const img = document.createElement('img');
  img.className = 'region-img';
  img.style.display = 'none';
  img.alt = 'Изображение региона';
  c.appendChild(img);
  (function next() {
    if (i >= exts.length) {
      const p = document.createElement('div');
      p.className = 'region-img-placeholder';
      p.textContent = 'Нет изображения';
      c.appendChild(p);
      return;
    }
    img.onload = () => { img.style.display = 'block'; };
    img.onerror = () => { i++; next(); };
    img.src = base + exts[i];
  })();
}

// ===================== ОТКРЫТИЕ/ЗАКРЫТИЕ =====================
function openSidebar(regionId, name, description, difficulty) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name || '';
  sidebarDesc.textContent = description || 'Описание отсутствует';
  loadRegionImage(regionId);
  if (difficultyContainer) {
    difficultyContainer.innerHTML = (difficulty !== undefined && difficulty !== null)
      ? `<div class="difficulty-row"><span class="difficulty-label">Сложность пути:</span><span class="difficulty-value">${Number(difficulty)}</span></div>`
      : '';
  }
  addReportSection();
  sidebar.style.display = 'block';
  sidebar.classList.add('open');
  setTimeout(() => { sidebar.style.transform = 'translateX(0)'; }, 10);
  loadReports(regionId);
  updateReportButton();
  updateKeeperDisplay();
}

function closeSidebar() {
  if (placementMode) { console.log('Режим размещения активен'); return; }
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', e => {
  e.stopPropagation();
  if (placementMode) resetPlacementState();
  closeSidebar();
});

// ===================== СЕКЦИЯ ОТЧЁТА =====================
function addReportSection() {
  const panel = document.querySelector('.panel-content');
  if (!panel) return;
  const existing = document.getElementById('report-section');
  if (existing) { existing.style.display = isAuthorized ? 'block' : 'none'; return; }

  const section = document.createElement('div');
  section.id = 'report-section';
  section.className = 'report-section';
  section.style.display = 'none';
  section.innerHTML = `
    <div class="report-header">
      <span class="report-title">Создать отчёт</span>
      <button id="toggle-report-btn" class="btn-mini">Свернуть</button>
    </div>
    <div id="report-fields">
      <div class="field"><label>Имя Хранителя узлов</label><input id="keeper-display" type="text" readonly></div>
      <div class="field"><label>Текст отчёта</label><textarea id="report-content" placeholder="Опишите события..."></textarea></div>
      <div class="field">
        <div class="field-row"><label>Умершие персонажи</label><button id="add-deceased-btn" class="btn-mini">+ Добавить</button></div>
        <div id="deceased-container"></div>
      </div>
      <div class="field">
        <label>Точки интереса</label>
        <div class="checks">
          <label><input type="checkbox" id="resource-check"> Место ресурса</label>
          <label><input type="checkbox" id="shelter-check"> Место ночлега</label>
        </div>
        <div id="marker-placement-hint" class="hint-yellow" style="display:none">Кликните на карту в то место, где хотите разместить метку</div>
        <div id="marker-placed-info" class="hint-green" style="display:none">Метка размещена. Вы можете переместить её, кликнув в другое место.</div>
        <div id="marker-status" class="marker-status">
          <span id="resource-status">Ресурс: не выбран</span>
          <span id="shelter-status">Ночлег: не выбран</span>
        </div>
      </div>
      <button id="submit-report-btn" class="btn-primary">Отправить отчёт</button>
    </div>`;
  panel.appendChild(section);

  document.getElementById('toggle-report-btn').onclick = function() {
    const f = document.getElementById('report-fields');
    const hidden = f.style.display === 'none';
    f.style.display = hidden ? 'block' : 'none';
    this.textContent = hidden ? 'Свернуть' : 'Развернуть';
  };
  document.getElementById('add-deceased-btn').onclick = addDeceasedField;
  document.getElementById('submit-report-btn').onclick = submitReportHandler;
  document.getElementById('resource-check').onchange = function() {
    if (this.checked) { activePlacementType = 'resource'; startPlacementMode('resource'); }
    else {
      removeTempMarker('resource'); updateMarkerStatus();
      if (!document.getElementById('shelter-check').checked) stopPlacementMode();
      else { activePlacementType = 'shelter'; startPlacementMode('shelter'); }
    }
  };
  document.getElementById('shelter-check').onchange = function() {
    if (this.checked) { activePlacementType = 'shelter'; startPlacementMode('shelter'); }
    else {
      removeTempMarker('shelter'); updateMarkerStatus();
      if (!document.getElementById('resource-check').checked) stopPlacementMode();
      else { activePlacementType = 'resource'; startPlacementMode('resource'); }
    }
  };
  addDeceasedField();
  updateKeeperDisplay();
  updateMarkerStatus();
  if (isAuthorized) section.style.display = 'block';
}

function updateReportSectionVisibility() {
  const s = document.getElementById('report-section');
  if (s) s.style.display = isAuthorized ? 'block' : 'none';
}
function updateKeeperDisplay() {
  const el = document.getElementById('keeper-display');
  if (el) el.value = getCurrentKeeper() || (isAuthorized ? 'Не указан' : 'Войдите по паролю');
}
function updateMarkerStatus() {
  const rc = document.getElementById('resource-check'), sc = document.getElementById('shelter-check');
  const rs = document.getElementById('resource-status'), ss = document.getElementById('shelter-status');
  if (rs) {
    const on = rc && rc.checked, pos = tempMarkers.resource !== null;
    rs.textContent = 'Ресурс: ' + (on ? (pos ? 'размещён' : 'выберите место на карте') : 'не выбран');
    rs.style.color = on ? (pos ? '#51cf66' : '#ffd700') : 'rgba(255,255,255,0.3)';
  }
  if (ss) {
    const on = sc && sc.checked, pos = tempMarkers.shelter !== null;
    ss.textContent = 'Ночлег: ' + (on ? (pos ? 'размещён' : 'выберите место на карте') : 'не выбран');
    ss.style.color = on ? (pos ? '#51cf66' : '#ffd700') : 'rgba(255,255,255,0.3)';
  }
}

// ===================== РЕЖИМ РАЗМЕЩЕНИЯ =====================
function startPlacementMode(type) {
  placementMode = type;
  const hint = document.getElementById('marker-placement-hint');
  if (hint) hint.style.display = 'block';
  const info = document.getElementById('marker-placed-info');
  if (info) info.style.display = 'none';
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.style.cursor = 'crosshair';
  if (mapClickListener) map.un('click', mapClickListener);
  mapClickListener = ev => {
    const [x, y] = ev.coordinate;
    updateTempMarker(x, y, type);
    if (info) info.style.display = 'block';
    if (hint) hint.style.display = 'none';
    updateMarkerStatus();
  };
  map.on('click', mapClickListener);
}
function stopPlacementMode() {
  placementMode = null; activePlacementType = null;
  const hint = document.getElementById('marker-placement-hint');
  if (hint) hint.style.display = 'none';
  const info = document.getElementById('marker-placed-info');
  if (info) info.style.display = 'none';
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.style.cursor = '';
  if (mapClickListener) { map.un('click', mapClickListener); mapClickListener = null; }
}
function updateTempMarker(x, y, type) {
  const iconSrc = type === 'resource' ? '/CHERTOGI_MAP/icons/resurs.png' : '/CHERTOGI_MAP/icons/Nochleg.png';
  const tooltip = type === 'resource' ? 'Место ресурса' : 'Место безопасного ночлега';
  removeTempMarker(type);
  const el = document.createElement('div');
  el.className = 'marker-button temp-marker temp-marker-' + type;
  el.innerHTML = `<img src="${iconSrc}" alt="${tooltip}" width="28" height="28"><span class="marker-tooltip">${tooltip}</span>`;
  el.style.opacity = '0.7';
  const ov = new ol.Overlay({ element: el, position: [x, y], positioning: 'bottom-center', offset: [0, -8], stopEvent: false });
  map.addOverlay(ov);
  tempMarkers[type] = { overlay: ov, position: { x, y } };
  updateMarkerStatus();
}
function removeTempMarker(type) {
  if (tempMarkers[type]?.overlay) { map.removeOverlay(tempMarkers[type].overlay); tempMarkers[type] = null; }
}
function getTempMarkerPosition(type) { return tempMarkers[type]?.position || null; }
function resetPlacementState() {
  stopPlacementMode();
  removeTempMarker('resource'); removeTempMarker('shelter');
  const rc = document.getElementById('resource-check'), sc = document.getElementById('shelter-check');
  if (rc) rc.checked = false;
  if (sc) sc.checked = false;
  updateMarkerStatus();
}

// ===================== ОТПРАВКА ОТЧЁТА =====================
async function submitReportHandler() {
  if (!isAuthorized) return alert('Сначала введите пароль!');
  if (currentRegionId === null || currentRegionId === undefined) return alert('Регион не выбран!');
  const content = document.getElementById('report-content')?.value.trim();
  if (!content) return alert('Напишите текст отчёта');

  const deceasedNames = [...document.querySelectorAll('.deceased-name')].map(i => i.value.trim()).filter(Boolean);
  const hasResource = document.getElementById('resource-check')?.checked || false;
  const hasShelter = document.getElementById('shelter-check')?.checked || false;
  if (hasResource && !tempMarkers.resource) return alert('Кликните на карту, чтобы разместить метку для "Место ресурса"');
  if (hasShelter && !tempMarkers.shelter) return alert('Кликните на карту, чтобы разместить метку для "Место ночлега"');

  const keeper = getCurrentKeeper();
  try {
    const rr = await _supabase.from('regions').select('x, y').eq('id', currentRegionId).single();
    if (rr.error) { console.error(rr.error); return alert('Не удалось получить координаты региона'); }

    const today = new Date().toISOString().split('T')[0];
    const toInsert = [];
    const base = { region_id: currentRegionId, keeper_name: keeper || null, content, deceased_names: deceasedNames.length ? deceasedNames : null, has_resource: false, has_shelter: false, marker_type: null, marker_x: null, marker_y: null, game_date: today };
    toInsert.push(base);

    if (hasResource && tempMarkers.resource) {
      const p = tempMarkers.resource.position;
      base.has_resource = true; base.marker_type = 'resource'; base.marker_x = p.x; base.marker_y = p.y;
    }
    if (hasShelter && tempMarkers.shelter) {
      const p = tempMarkers.shelter.position;
      base.has_shelter = true;
      if (!base.marker_type) { base.marker_type = 'shelter'; base.marker_x = p.x; base.marker_y = p.y; }
      else toInsert.push({ ...base, content: content + ' (Место ночлега)', deceased_names: null, has_resource: false, has_shelter: true, marker_type: 'shelter', marker_x: p.x, marker_y: p.y });
    }

    for (const row of toInsert) {
      const r = await _supabase.from('game_reports').insert([row]);
      if (r.error) { console.error(r.error); return alert('Ошибка: ' + r.error.message); }
    }

    let msg = '📝 Отчёт отправлен на модерацию!\n\nОн будет проверен Хранителем узлов в ближайшее время.\nПосле одобрения отчёт появится на карте.\n\n';
    if (deceasedNames.length) msg += `✅ Добавлено имён умерших: ${deceasedNames.length}\n`;
    if (hasResource) msg += '✅ Отмечено место ресурса\n';
    if (hasShelter) msg += '✅ Отмечено место ночлега\n';
    alert(msg);

    document.getElementById('report-content').value = '';
    document.getElementById('deceased-container').innerHTML = '';
    document.getElementById('resource-check').checked = false;
    document.getElementById('shelter-check').checked = false;
    addDeceasedField();
    resetPlacementState();
    await loadReports(currentRegionId);
    if (typeof loadReportMarkers === 'function') await loadReportMarkers();
  } catch (e) { console.error('Критическая ошибка:', e); alert('Ошибка: ' + e.message); }
}

function resetAuthorization() {
  if (!confirm('Вы уверены, что хотите сменить Хранителя узлов? Текущий сеанс будет завершён.')) return;
  setReportAuthorized(false); setCurrentKeeper('');
  updateReportButton(); updateKeeperDisplay(); updateReportSectionVisibility(); resetPlacementState();
  const s = document.getElementById('report-section'); if (s) s.style.display = 'none';
  const b = document.getElementById('report-btn');
  if (b) { b.textContent = 'Введите пароль для создания отчёта'; b.style.opacity = '0.6'; b.style.cursor = 'pointer'; b.onclick = openPasswordModal; }
}

function updateReportButton() {
  const b = document.getElementById('report-btn'); if (!b) return;
  if (isAuthorized) {
    const k = getCurrentKeeper();
    b.textContent = k ? `Составить отчёт (${k})` : 'Составить отчёт';
    b.style.opacity = '1'; b.style.cursor = 'pointer'; b.onclick = null;
    updateReportSectionVisibility();
    if (!document.getElementById('change-keeper-btn')) {
      const btn = document.createElement('button');
      btn.id = 'change-keeper-btn';
      btn.textContent = 'Сменить Хранителя';
      btn.className = 'btn-change-keeper';
      btn.onclick = resetAuthorization;
      b.parentNode.insertBefore(btn, b.nextSibling);
    }
  } else {
    b.textContent = 'Введите пароль для создания отчёта';
    b.style.opacity = '0.6'; b.style.cursor = 'pointer'; b.onclick = openPasswordModal;
    updateReportSectionVisibility(); resetPlacementState();
    document.getElementById('change-keeper-btn')?.remove();
  }
}

// ===================== МОДАЛКА ПАРОЛЯ =====================
const passwordModal = document.createElement('div');
passwordModal.id = 'password-modal';
passwordModal.className = 'modal-overlay';
passwordModal.innerHTML = `
  <div class="modal-box">
    <h3 class="modal-title">Введите пароль</h3>
    <p class="modal-sub">Введите пароль для доступа к созданию отчётов</p>
    <input id="password-input" type="password" placeholder="Введите пароль..." class="modal-input">
    <input id="keeper-input" type="text" placeholder="Имя Хранителя узлов..." class="modal-input">
    <div class="modal-actions">
      <button id="password-submit-btn" class="btn-primary">Подтвердить</button>
      <button id="password-cancel-btn" class="btn-cancel">Отмена</button>
    </div>
    <div id="password-error" class="modal-error"></div>
  </div>`;
document.body.appendChild(passwordModal);

const passwordInput = document.getElementById('password-input');
const keeperInput = document.getElementById('keeper-input');
const passwordSubmitBtn = document.getElementById('password-submit-btn');
const passwordError = document.getElementById('password-error');

function openPasswordModal() {
  passwordInput.value = ''; keeperInput.value = '';
  passwordError.style.display = 'none';
  passwordModal.style.display = 'flex';
  setTimeout(() => passwordInput.focus(), 100);
}
function closePasswordModal() { passwordModal.style.display = 'none'; }

passwordSubmitBtn.onclick = async () => {
  const pwd = passwordInput.value.trim(), kn = keeperInput.value.trim();
  if (!pwd) { passwordError.textContent = 'Введите пароль'; passwordError.style.display = 'block'; return; }
  if (!kn) { passwordError.textContent = 'Введите имя Хранителя узлов'; passwordError.style.display = 'block'; return; }
  passwordSubmitBtn.disabled = true; passwordSubmitBtn.textContent = 'Проверка...';
  passwordError.style.display = 'none';
  const ok = await checkPasswordViaServer(pwd);
  passwordSubmitBtn.disabled = false; passwordSubmitBtn.textContent = 'Подтвердить';
  if (ok) {
    setReportAuthorized(true); setCurrentKeeper(kn); closePasswordModal();
    updateReportButton(); updateKeeperDisplay(); updateReportSectionVisibility();
    const s = document.getElementById('report-section'); if (s) s.style.display = 'block';
    if (currentRegionId !== null && currentRegionId !== undefined) loadReports(currentRegionId);
  } else {
    passwordError.textContent = 'Неверный пароль'; passwordError.style.display = 'block';
    passwordInput.value = ''; passwordInput.focus();
  }
};
document.getElementById('password-cancel-btn').onclick = closePasswordModal;
passwordModal.onclick = e => { if (e.target === passwordModal) closePasswordModal(); };
passwordInput.onkeydown = e => { if (e.key === 'Enter') keeperInput.focus(); };
keeperInput.onkeydown = e => { if (e.key === 'Enter') passwordSubmitBtn.click(); };

loadAuthState();
if (isAuthorized) {
  document.addEventListener('DOMContentLoaded', () => {
    updateReportButton(); updateKeeperDisplay(); updateReportSectionVisibility();
    const s = document.getElementById('report-section'); if (s) s.style.display = 'block';
  });
}

// ===================== МОДАЛКА РЕДАКТИРОВАНИЯ =====================
const editModal = document.createElement('div');
editModal.id = 'edit-report-modal';
editModal.className = 'modal-overlay';
editModal.innerHTML = `
  <div class="modal-box" style="max-width:500px">
    <h3 class="modal-title">Редактировать отчёт</h3>
    <input type="hidden" id="edit-report-id">
    <textarea id="edit-report-content" class="modal-input" style="min-height:150px;resize:vertical;"></textarea>
    <div class="modal-actions">
      <button id="edit-submit-btn" class="btn-primary">Отправить на модерацию</button>
      <button id="edit-cancel-btn" class="btn-cancel">Отмена</button>
    </div>
    <div id="edit-error" class="modal-error"></div>
  </div>`;
document.body.appendChild(editModal);

function openEditReportModal(id, content) {
  document.getElementById('edit-report-id').value = id;
  document.getElementById('edit-report-content').value = content;
  document.getElementById('edit-error').style.display = 'none';
  editModal.style.display = 'flex';
}
document.getElementById('edit-cancel-btn').onclick = () => { editModal.style.display = 'none'; };
document.getElementById('edit-submit-btn').onclick = async function() {
  const id = document.getElementById('edit-report-id').value;
  const content = document.getElementById('edit-report-content').value.trim();
  const errEl = document.getElementById('edit-error');
  if (!content) { errEl.textContent = 'Текст отчёта не может быть пустым'; errEl.style.display = 'block'; return; }
  this.disabled = true; this.textContent = 'Отправка...';
  try {
    const r = await _supabase.from('game_reports').update({ content, is_approved: null }).eq('id', id);
    if (r.error) throw new Error(r.error.message);
    try {
      await fetch('https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLIC_KEY, Authorization: 'Bearer ' + SUPABASE_PUBLIC_KEY },
        body: JSON.stringify({ type: 'UPDATE', record: { id, region_id: currentRegionId, keeper_name: getCurrentKeeper(), content } })
      });
    } catch (e) { console.error('Ошибка вызова бота:', e); }
    alert('✅ Отчёт отправлен на повторную модерацию!');
    editModal.style.display = 'none';
    if (currentRegionId !== null && currentRegionId !== undefined) {
      await loadReports(currentRegionId);
      if (typeof loadReportMarkers === 'function') await loadReportMarkers();
    }
  } catch (e) {
    console.error('Ошибка редактирования:', e);
    errEl.textContent = 'Ошибка: ' + e.message; errEl.style.display = 'block';
  } finally { this.disabled = false; this.textContent = 'Отправить на модерацию'; }
};

// ===================== ЗАКРЫТИЕ ПО КЛИКУ НА КАРТУ =====================
function closeSidebarOnMapClick() {
  if (typeof map === 'undefined') return;
  map.on('click', ev => {
    if (placementMode) return;
    if (ev.originalEvent.target.closest('.ol-overlay-container')) return;
    const sb = document.getElementById('region-sidebar');
    if (sb && sb.style.display === 'block') closeSidebar();
  });
}
setTimeout(closeSidebarOnMapClick, 1000);
