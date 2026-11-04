// ============================================================
// БОКОВАЯ ПАНЕЛЬ
// ============================================================

let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');
const difficultyContainer = document.getElementById('region-difficulty');

// ============================================================
// КОНФИГУРАЦИЯ АВТОРИЗАЦИИ
// ============================================================

const STORAGE_KEY = 'chertogi_report_auth';
const EDGE_FUNCTION_URL = 'https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/check-report-password';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';

let isAuthorized = false;
let currentKeeper = '';

// ============================================================
// ПРОВЕРКА ПАРОЛЯ
// ============================================================

async function checkPasswordViaServer(password) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_PUBLIC_KEY },
      body: JSON.stringify({ password: password })
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.ok === true;
  } catch (err) {
    console.error('Ошибка проверки пароля:', err);
    return false;
  }
}

// ============================================================
// АВТОРИЗАЦИЯ
// ============================================================

function loadAuthState() {
  try {
    var saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      var data = JSON.parse(saved);
      isAuthorized = data.isAuthorized || false;
      currentKeeper = data.currentKeeper || '';
      return true;
    }
  } catch (e) {}
  return false;
}

function saveAuthState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthorized: isAuthorized, currentKeeper: currentKeeper }));
  } catch (e) {}
}

function isReportAuthorized() { return isAuthorized; }
function setReportAuthorized(value) { isAuthorized = value; saveAuthState(); }
function getCurrentKeeper() { return currentKeeper; }
function setCurrentKeeper(name) { currentKeeper = name; saveAuthState(); }

function addDeceasedField() {
  var container = document.getElementById('deceased-container');
  if (!container) return;
  var div = document.createElement('div');
  div.className = 'deceased-field';
  div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
  div.innerHTML = `
    <input type="text" class="deceased-name" placeholder="Имя умершего персонажа..." style="flex:1; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px;">
    <button class="remove-deceased-btn" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: 18px; padding: 0 8px;">X</button>
  `;
  div.querySelector('.remove-deceased-btn').addEventListener('click', function() { div.remove(); });
  container.appendChild(div);
}

// ============================================================
// ИЗОБРАЖЕНИЕ РЕГИОНА
// ============================================================

function getRegionImagePath(regionId) {
  var mapping = {0:0, 1:2, 2:1, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10};
  return '/CHERTOGI_MAP/images/' + (mapping[regionId] !== undefined ? mapping[regionId] : regionId);
}

function loadRegionImage(regionId) {
  var imgContainer = document.getElementById('region-image-placeholder');
  if (!imgContainer) return;
  imgContainer.innerHTML = '';
  imgContainer.style.cssText = 'display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #4a0e0e; position: relative; width: 100%; min-height: 150px; max-height: 350px; height: auto; padding: 0;';
  
  var basePath = getRegionImagePath(regionId);
  var extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  var currentIndex = 0;
  
  var imgElement = document.createElement('img');
  imgElement.style.cssText = 'width: 100%; height: 100%; object-fit: contain; max-height: 350px; min-height: 150px; display: none; background: #4a0e0e;';
  imgElement.alt = 'Изображение региона';
  imgContainer.appendChild(imgElement);
  
  function tryLoadNext() {
    if (currentIndex >= extensions.length) {
      imgElement.style.display = 'none';
      var placeholder = document.createElement('div');
      placeholder.textContent = 'Нет изображения';
      placeholder.style.cssText = 'color: rgba(255, 255, 255, 0.3); font-size: 14px; font-family: Philosopher, sans-serif; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 150px;';
      imgContainer.appendChild(placeholder);
      return;
    }
    imgElement.onload = function() { imgElement.style.display = 'block'; };
    imgElement.onerror = function() { currentIndex++; tryLoadNext(); };
    imgElement.src = basePath + extensions[currentIndex];
  }
  tryLoadNext();
}

// ============================================================
// ОТКРЫТИЕ/ЗАКРЫТИЕ ПАНЕЛИ
// ============================================================

function openSidebar(regionId, name, description, difficulty) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name || '';
  sidebarDesc.textContent = description || 'Описание отсутствует';
  loadRegionImage(regionId);

  if (difficultyContainer) {
    if (difficulty !== undefined && difficulty !== null) {
      difficultyContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin: 12px 0 16px 0; padding: 8px 12px; background: rgba(74, 14, 14, 0.4); border-radius: 6px; border-left: 3px solid #4a0e0e;">
          <span style="color: #aaa; font-size: 14px; font-family: "Philosopher", sans-serif;">Сложность пути:</span>
          <span style="color: #ffd700; font-size: 18px; font-weight: 700; font-family: "Philosopher", sans-serif;">${Number(difficulty)}</span>
        </div>`;
    } else { difficultyContainer.innerHTML = ''; }
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
  if (placementMode) return;
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  if (placementMode) stopPlacementMode();
  closeSidebar();
});

// ============================================================
// СЕКЦИЯ ОТЧЁТА
// ============================================================

function addReportSection() {
  var panelContent = document.querySelector('.panel-content');
  if (!panelContent) return;
  
  var existingSection = document.getElementById('report-section');
  if (existingSection) {
    existingSection.style.display = isAuthorized ? 'block' : 'none';
    return;
  }
  
  var section = document.createElement('div');
  section.id = 'report-section';
  section.style.cssText = 'margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: none;';
  
  section.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="color: #ffd700; font-family: "Calypso", serif; font-size: 18px; letter-spacing: 1px; font-weight: normal;">Создать отчёт</span>
        <button id="toggle-report-btn" style="background: transparent; border: 1px solid rgba(255,215,0,0.2); color: #ffd700; padding: 2px 12px; border-radius: 4px; cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px;">Свернуть</button>
      </div>
      <div id="report-fields" style="display: block;">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 13px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Имя Хранителя узлов</label>
          <input id="keeper-display" type="text" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffd700; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px;" readonly>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="font-size: 13px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Текст отчёта</label>
          <textarea id="report-content" placeholder="Опишите события..." style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px; min-height: 60px; resize: vertical;"></textarea>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 13px; color: rgba(255,255,255,0.5);">Умершие персонажи</label>
            <button id="add-deceased-btn" style="background: rgba(74,14,14,0.3); border: 1px solid #4a0e0e; border-radius: 4px; color: #ffd700; padding: 2px 12px; cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px;">+ Добавить</button>
          </div>
          <div id="deceased-container"></div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <label style="font-size:13px;color:rgba(255,255,255,.5)">Точки интереса</label>
            <button id="add-marker-btn" style="background:rgba(74,14,14,.3);border:1px solid #4a0e0e;border-radius:4px;color:#ffd700;padding:2px 12px;cursor:pointer;font-family:'Philosopher',sans-serif;font-size:12px">+ Добавить метку</button>
          </div>
          <div id="resources-container"></div>
        </div>
        
        <button id="submit-report-btn" style="width: 100%; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif; font-weight: bold; transition: all 0.3s;">Отправить отчёт</button>
      </div>
    </div>
  `;
  
  panelContent.appendChild(section);
  
  document.getElementById('toggle-report-btn')?.addEventListener('click', function() {
    var fields = document.getElementById('report-fields');
    if (fields) {
      if (fields.style.display === 'none') {
        fields.style.display = 'block'; this.textContent = 'Свернуть';
      } else {
        fields.style.display = 'none'; this.textContent = 'Развернуть';
      }
    }
  });
  
  document.getElementById('add-deceased-btn')?.addEventListener('click', addDeceasedField);
  document.getElementById('submit-report-btn')?.addEventListener('click', submitReportHandler);
  
  document.getElementById('add-marker-btn')?.addEventListener('click', addMarkerField);
  if (!document.querySelector('.marker-field')) addMarkerField();
  
  addDeceasedField();
  updateKeeperDisplay();
  
  if (isAuthorized) section.style.display = 'block';
}

function updateReportSectionVisibility() {
  var section = document.getElementById('report-section');
  if (section) section.style.display = isAuthorized ? 'block' : 'none';
}

function updateKeeperDisplay() {
  var keeperDisplay = document.getElementById('keeper-display');
  if (keeperDisplay) keeperDisplay.value = getCurrentKeeper() || (isAuthorized ? 'Не указан' : 'Войдите по паролю');
}

// ============================================================
// МЕТКИ (НЕОГРАНИЧЕННОЕ КОЛИЧЕСТВО)
// ============================================================

var pendingMarkers=[], placementMode=null, activeMarkerId=null, mapClickListener=null, nextMarkerId=1;
var MARKER_TYPES={
  resource:{label:'Место ресурса',icon:'/CHERTOGI_MAP/icons/resurs.png'},
  shelter:{label:'Место ночлега',icon:'/CHERTOGI_MAP/icons/Nochleg.png'},
  ruin:{label:'Руины',icon:'/CHERTOGI_MAP/icons/ruins.png'}
};

function startNewMarkerPlacement(){
  placementMode='new'; activeMarkerId=null; attachMapClickListener();
  var m=document.getElementById('map'); if(m) m.style.cursor='crosshair';
}

function attachMapClickListener(){
  if(mapClickListener){ map.un('click',mapClickListener); mapClickListener=null; }
  mapClickListener=function(e){
    var c=e.coordinate, x=c[0], y=c[1];
    if('new'===placementMode){
      var f=document.querySelector('.marker-field:last-child');
      var t=f ? f.querySelector('.marker-type').value : 'resource';
      var d=f ? f.querySelector('.marker-desc').value.trim() : '';
      var mk=addPendingMarker(t,d,x,y);
      markFieldAsPicked(mk.id);
    } else if('move'===placementMode && null!==activeMarkerId) {
      movePendingMarker(activeMarkerId,x,y);
    }
    stopPlacementMode();
  };
  map.on('click', mapClickListener);
}

function stopPlacementMode(){
  placementMode=null; activeMarkerId=null;
  var m=document.getElementById('map'); if(m) m.style.cursor='';
  if(mapClickListener){ map.un('click',mapClickListener); mapClickListener=null; }
}

function addPendingMarker(type,desc,x,y){
  var id=nextMarkerId++, cfg=MARKER_TYPES[type]||MARKER_TYPES.resource;
  var el=document.createElement('div');
  el.className='marker-button temp-marker';
  el.innerHTML='<img src="'+cfg.icon+'" alt="'+cfg.label+'" width="28" height="28"><span class="marker-tooltip">'+cfg.label+(desc?': '+desc:'')+'</span>';
  el.style.opacity='.8';
  var ov=new ol.Overlay({element:el,position:[x,y],positioning:'bottom-center',offset:[0,-8],stopEvent:!1});
  map.addOverlay(ov);
  var mk={id:id,type:type,description:desc,x:x,y:y,overlay:ov};
  pendingMarkers.push(mk);
  renderMarkersList();
  return mk;
}

function movePendingMarker(id,x,y){
  for(var i=0;i<pendingMarkers.length;i++) if(pendingMarkers[i].id===id){
    pendingMarkers[i].x=x; pendingMarkers[i].y=y; pendingMarkers[i].overlay.setPosition([x,y]); renderMarkersList(); return;
  }
}

function markFieldAsPicked(id){
  var fs=document.querySelectorAll('.marker-field'), f=fs[fs.length-1]; if(!f) return;
  var b=f.querySelector('.pick-on-map-btn');
  if(b){ b.classList.remove('waiting'); b.classList.add('picked'); b.textContent='✓ Готово'; }
}

function resetPendingMarkers(){
  for(var i=0;i<pendingMarkers.length;i++) if(pendingMarkers[i].overlay) map.removeOverlay(pendingMarkers[i].overlay);
  pendingMarkers=[]; nextMarkerId=1; stopPlacementMode();
  var c=document.getElementById('resources-container'); if(c) c.innerHTML='';
  renderMarkersList();
}

function addMarkerField() {
  var c = document.getElementById('resources-container'); 
  if (!c) return;

  var d = document.createElement('div'); 
  d.className = 'marker-field';
  
  d.innerHTML = `
    <select class="marker-type">
      <option value="resource">Ресурс</option>
      <option value="shelter">Ночлег</option>
      <option value="ruin">Руины</option>
    </select>
    <input type="text" class="marker-desc" placeholder="Описание">
    <button class="pick-on-map-btn waiting" type="button">Указать на карте</button>
    <button class="remove-btn" type="button" title="Удалить метку">×</button>
  `;
  
  d.querySelector('.pick-on-map-btn').addEventListener('click', function(e) {
    e.preventDefault(); 
    startNewMarkerPlacement();
    
    // Убираем активный статус у всех кнопок
    document.querySelectorAll('.pick-on-map-btn').forEach(function(b) { 
      b.classList.remove('waiting'); 
    });
    
    this.classList.add('waiting'); 
    this.textContent = 'Кликните на карту...';
  });
  
  d.querySelector('.remove-btn').addEventListener('click', function(e) { 
    e.preventDefault(); 
    d.remove(); 
    renderMarkersList(); 
  });
  
  c.appendChild(d);
}

function renderMarkersList(){
  var c=document.getElementById('resources-container'); if(!c) return;
  c.querySelectorAll('.marker-field').forEach(function(f,idx){
    var b=f.querySelector('.pick-on-map-btn'); if(!b) return;
    var mk=pendingMarkers[idx];
    if(mk){
      b.classList.remove('waiting'); b.classList.add('picked');
      b.textContent='✓ '+MARKER_TYPES[mk.type].label+' ('+Math.round(mk.x)+', '+Math.round(mk.y)+')';
      f.dataset.markerId=mk.id;
    } else {
      b.classList.remove('picked');
      if(!b.classList.contains('waiting')) b.textContent='Указать на карте';
    }
  });
}

// ============================================================
// ОТПРАВКА ОТЧЁТА
// ============================================================

async function submitReportHandler() {
  console.log('Отправка отчёта...');
  
  if (!isAuthorized) return alert('Сначала введите пароль!');
  if (currentRegionId === null || currentRegionId === undefined) return alert('Регион не выбран!');
  
  var content = document.getElementById('report-content')?.value.trim();
  if (!content) return alert('Напишите текст отчёта');

  var deceasedInputs = document.querySelectorAll('.deceased-name');
  var deceasedNames = [];
  deceasedInputs.forEach(function(input) {
    var name = input.value.trim();
    if (name) deceasedNames.push(name);
  });

  var keeperName = getCurrentKeeper();

  try {
    // Собираем метки
    var resources = pendingMarkers.filter(function(m){ return m.type==='resource'; }).map(function(m){ return {description: m.description, x: m.x, y: m.y}; });
    var shelters = pendingMarkers.filter(function(m){ return m.type==='shelter'; }).map(function(m){ return {description: m.description, x: m.x, y: m.y}; });
    var ruins = pendingMarkers.filter(function(m){ return m.type==='ruin'; }).map(function(m){ return {description: m.description, x: m.x, y: m.y}; });

    // Формируем отчёт
    var baseReport = {
      region_id: currentRegionId,
      keeper_name: keeperName || null,
      content: content,
      deceased_names: deceasedNames.length > 0 ? deceasedNames : null,
      has_resource: resources.length > 0,
      has_shelter: shelters.length > 0,
      resources: resources.length > 0 ? resources : null,
      shelters: shelters.length > 0 ? shelters : null,
      ruins: ruins.length > 0 ? ruins : null,
      marker_type: resources.length > 0 ? 'resource' : (shelters.length > 0 ? 'shelter' : null),
      marker_x: resources.length > 0 ? resources[0].x : (shelters.length > 0 ? shelters[0].x : null),
      marker_y: resources.length > 0 ? resources[0].y : (shelters.length > 0 ? shelters[0].y : null),
      game_date: new Date().toISOString().split('T')[0]
    };

    console.log('PAYLOAD:', JSON.stringify(baseReport)); // Для дебага

    var result = await _supabase.from('game_reports').insert([baseReport]);
      
    if (result.error) {
      console.error('Ошибка отправки отчёта:', result.error);
      return alert('Ошибка: ' + result.error.message);
    }

    var message = '📝 Отчёт отправлен на модерацию!\n\nОн будет проверен Хранителем узлов в ближайшее время.\nПосле одобрения отчёт появится на карте.\n\n';
    if (deceasedNames.length > 0) message += '✅ Добавлено имён умерших: ' + deceasedNames.length + '\n';
    if (resources.length > 0) message += '✅ Отмечено мест ресурса: ' + resources.length + '\n';
    if (shelters.length > 0) message += '✅ Отмечено мест ночлега: ' + shelters.length + '\n';
    if (ruins.length > 0) message += '✅ Отмечено руин: ' + ruins.length + '\n';

    alert(message);
    
    // Очистка формы
    document.getElementById('report-content').value = '';
    document.getElementById('deceased-container').innerHTML = '';
    addDeceasedField();
    resetPendingMarkers();
    addMarkerField(); // Оставляем одно пустое поле для следующего отчёта
    
    await loadReports(currentRegionId);
    if (typeof loadReportMarkers === 'function') await loadReportMarkers();
    
  } catch (err) {
    console.error('Критическая ошибка:', err);
    alert('Ошибка: ' + err.message);
  }
}

// ============================================================
// СМЕНА ХРАНИТЕЛЯ И КНОПКИ
// ============================================================

function resetAuthorization() {
  if (confirm('Вы уверены, что хотите сменить Хранителя узлов? Текущий сеанс будет завершён.')) {
    setReportAuthorized(false);
    setCurrentKeeper('');
    updateReportButton();
    updateKeeperDisplay();
    updateReportSectionVisibility();
    resetPendingMarkers();
    
    var section = document.getElementById('report-section');
    if (section) section.style.display = 'none';
    
    var reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.textContent = 'Введите пароль для создания отчёта';
      reportBtn.style.opacity = '0.6';
      reportBtn.onclick = function() { openPasswordModal(); };
    }
  }
}

function updateReportButton() {
  var reportBtn = document.getElementById('report-btn');
  if (!reportBtn) return;
  
  if (isAuthorized) {
    var keeper = getCurrentKeeper();
    reportBtn.textContent = keeper ? 'Составить отчёт (' + keeper + ')' : 'Составить отчёт';
    reportBtn.style.opacity = '1';
    reportBtn.onclick = null;
    updateReportSectionVisibility();
    
    var changeBtn = document.getElementById('change-keeper-btn');
    if (!changeBtn) {
      var btn = document.createElement('button');
      btn.id = 'change-keeper-btn';
      btn.textContent = 'Сменить Хранителя';
      btn.style.cssText = 'width: 100%; padding: 6px; margin-top: 6px; background: rgba(74,14,14,0.3); border: 1px solid rgba(74,14,14,0.3); border-radius: 4px; color: rgba(255,255,255,0.5); cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px; transition: all 0.3s;';
      btn.onmouseover = function() { this.style.background = 'rgba(74,14,14,0.6)'; this.style.color = '#ffffff'; };
      btn.onmouseout = function() { this.style.background = 'rgba(74,14,14,0.3)'; this.style.color = 'rgba(255,255,255,0.5)'; };
      btn.onclick = resetAuthorization;
      reportBtn.parentNode.insertBefore(btn, reportBtn.nextSibling);
    }
  } else {
    reportBtn.textContent = 'Введите пароль для создания отчёта';
    reportBtn.style.opacity = '0.6';
    reportBtn.onclick = function() { openPasswordModal(); };
    updateReportSectionVisibility();
    resetPendingMarkers();
    
    var changeBtn = document.getElementById('change-keeper-btn');
    if (changeBtn) changeBtn.remove();
  }
}

// ============================================================
// МОДАЛЬНЫЕ ОКНА
// ============================================================

var passwordModal = document.createElement('div');
passwordModal.id = 'password-modal';
passwordModal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 2000; justify-content: center; align-items: center;';
passwordModal.innerHTML = `
  <div style="background: #1a0a1a; border: 1px solid #4a0e0e; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; color: #ffffff; box-shadow: 0 8px 40px rgba(0,0,0,0.8);">
    <h3 style="font-family: "Calypso", serif; color: #ffd700; text-align: center; margin-top: 0; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px;">Введите пароль</h3>
    <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 16px;">Введите пароль для доступа к созданию отчётов</p>
    <input id="password-input" type="password" placeholder="Введите пароль..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 16px;">
    <input id="keeper-input" type="text" placeholder="Имя Хранителя узлов..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 16px;">
    <div style="display: flex; gap: 10px;">
      <button id="password-submit-btn" style="flex: 1; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif; font-weight: bold; transition: all 0.3s;">Подтвердить</button>
      <button id="password-cancel-btn" style="padding: 10px 20px; background: transparent; color: #888; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif;">Отмена</button>
    </div>
    <div id="password-error" style="color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 8px; display: none;"></div>
  </div>`;
document.body.appendChild(passwordModal);

var passwordInput = document.getElementById('password-input');
var keeperInput = document.getElementById('keeper-input');
var passwordSubmitBtn = document.getElementById('password-submit-btn');
var passwordCancelBtn = document.getElementById('password-cancel-btn');
var passwordError = document.getElementById('password-error');

function openPasswordModal() {
  passwordInput.value = ''; keeperInput.value = ''; passwordError.style.display = 'none';
  passwordModal.style.display = 'flex';
  setTimeout(function() { passwordInput.focus(); }, 100);
}

function closePasswordModal() { passwordModal.style.display = 'none'; }

passwordSubmitBtn.addEventListener('click', async function() {
  var inputPassword = passwordInput.value.trim();
  var keeperName = keeperInput.value.trim();

  if (!inputPassword) { passwordError.textContent = 'Введите пароль'; passwordError.style.display = 'block'; return; }
  if (!keeperName) { passwordError.textContent = 'Введите имя Хранителя узлов'; passwordError.style.display = 'block'; return; }

  passwordSubmitBtn.disabled = true; passwordSubmitBtn.textContent = 'Проверка...'; passwordError.style.display = 'none';

  var isCorrect = await checkPasswordViaServer(inputPassword);

  passwordSubmitBtn.disabled = false; passwordSubmitBtn.textContent = 'Подтвердить';

  if (isCorrect) {
    setReportAuthorized(true); setCurrentKeeper(keeperName);
    closePasswordModal(); updateReportButton(); updateKeeperDisplay(); updateReportSectionVisibility();
    var section = document.getElementById('report-section'); if (section) section.style.display = 'block';
    if (currentRegionId !== null) loadReports(currentRegionId);
  } else {
    passwordError.textContent = 'Неверный пароль'; passwordError.style.display = 'block';
    passwordInput.value = ''; passwordInput.focus();
  }
});

passwordCancelBtn.addEventListener('click', closePasswordModal);
passwordModal.addEventListener('click', function(e) { if (e.target === this) closePasswordModal(); });
passwordInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') keeperInput.focus(); });
keeperInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') passwordSubmitBtn.click(); });

loadAuthState();
if (isAuthorized) {
  document.addEventListener('DOMContentLoaded', function() {
    updateReportButton(); updateKeeperDisplay(); updateReportSectionVisibility();
    var section = document.getElementById('report-section'); if (section) section.style.display = 'block';
  });
}

// ============================================================
// РЕДАКТИРОВАНИЕ ОТЧЁТА
// ============================================================

var editReportModal = document.createElement('div');
editReportModal.id = 'edit-report-modal';
editReportModal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 2000; justify-content: center; align-items: center;';
editReportModal.innerHTML = `
  <div style="background: #1a0a1a; border: 1px solid #4a0e0e; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; color: #ffffff; box-shadow: 0 8px 40px rgba(0,0,0,0.8);">
    <h3 style="font-family: "Calypso", serif; color: #ffd700; text-align: center; margin-top: 0; margin-bottom: 16px; font-weight: normal; letter-spacing: 2px;">Редактировать отчёт</h3>
    <input type="hidden" id="edit-report-id">
    <textarea id="edit-report-content" style="width: 100%; min-height: 150px; padding: 10px; margin-bottom: 16px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px; resize: vertical;"></textarea>
    <div style="display: flex; gap: 10px;">
      <button id="edit-submit-btn" style="flex: 1; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif; font-weight: bold; transition: all 0.3s;">Отправить на модерацию</button>
      <button id="edit-cancel-btn" style="padding: 10px 20px; background: transparent; color: #888; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif;">Отмена</button>
    </div>
    <div id="edit-error" style="color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 8px; display: none;"></div>
  </div>`;
document.body.appendChild(editReportModal);

function openEditReportModal(reportId, content) {
  document.getElementById('edit-report-id').value = reportId;
  document.getElementById('edit-report-content').value = content;
  document.getElementById('edit-error').style.display = 'none';
  editReportModal.style.display = 'flex';
}

document.getElementById('edit-cancel-btn').addEventListener('click', function() { editReportModal.style.display = 'none'; });

document.getElementById('edit-submit-btn').addEventListener('click', async function() {
  var reportId = document.getElementById('edit-report-id').value;
  var newContent = document.getElementById('edit-report-content').value.trim();
  var errorEl = document.getElementById('edit-error');
  var submitBtn = this;

  if (!newContent) { errorEl.textContent = 'Текст отчёта не может быть пустым'; errorEl.style.display = 'block'; return; }

  submitBtn.disabled = true; submitBtn.textContent = 'Отправка...';

  try {
    var result = await _supabase.from('game_reports').update({ content: newContent, is_approved: null }).eq('id', reportId);
    if (result.error) throw new Error(result.error.message);

    try {
      await fetch('https://djieimjwhgjgsjcysceh.supabase.co/functions/v1/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_PUBLIC_KEY, 'Authorization': 'Bearer ' + SUPABASE_PUBLIC_KEY },
        body: JSON.stringify({ type: 'UPDATE', record: { id: reportId, region_id: currentRegionId, keeper_name: getCurrentKeeper(), content: newContent } })
      });
    } catch (botErr) {}

    alert('✅ Отчёт отправлен на повторную модерацию!');
    editReportModal.style.display = 'none';
    if (currentRegionId !== null) {
      await loadReports(currentRegionId);
      if (typeof loadReportMarkers === 'function') await loadReportMarkers();
    }
  } catch (err) {
    errorEl.textContent = 'Ошибка: ' + err.message; errorEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false; submitBtn.textContent = 'Отправить на модерацию';
  }
});

// ============================================================
// ЗАКРЫТИЕ ПРИ КЛИКЕ НА КАРТУ
// ============================================================

function closeSidebarOnMapClick() {
  if (typeof map !== 'undefined') {
    map.on('click', function(event) {
      if (placementMode) return;
      var target = event.originalEvent.target;
      var isOverlay = target.closest('.ol-overlay-container') !== null;
      if (!isOverlay) {
        var sidebarEl = document.getElementById('region-sidebar');
        if (sidebarEl && sidebarEl.style.display === 'block') closeSidebar();
      }
    });
  }
}
setTimeout(closeSidebarOnMapClick, 1000);
