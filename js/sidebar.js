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
// КОНФИГУРАЦИЯ ПАРОЛЯ
// ============================================================

const REPORT_PASSWORD = 'CHERTOGI2024';
const STORAGE_KEY = 'chertogi_report_auth';
let isAuthorized = false;
let currentKeeper = '';

// ============================================================
// СОСТОЯНИЕ ДЛЯ РАЗМЕЩЕНИЯ МЕТОК
// ============================================================

let placementMode = null;
let tempMarkers = {
  resource: null,
  shelter: null
};
let mapClickListener = null;
let activePlacementType = null;

function loadAuthState() {
  try {
    var saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      var data = JSON.parse(saved);
      isAuthorized = data.isAuthorized || false;
      currentKeeper = data.currentKeeper || '';
      console.log('Загружено состояние авторизации:', isAuthorized ? 'Открыт' : 'Закрыт');
      return true;
    }
  } catch (e) {
    console.warn('Ошибка загрузки состояния:', e);
  }
  return false;
}

function saveAuthState() {
  try {
    var data = {
      isAuthorized: isAuthorized,
      currentKeeper: currentKeeper
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Ошибка сохранения состояния:', e);
  }
}

function isReportAuthorized() {
  return isAuthorized;
}

function setReportAuthorized(value) {
  isAuthorized = value;
  saveAuthState();
  console.log('Статус доступа к отчётам:', isAuthorized ? 'Открыт' : 'Закрыт');
}

function getCurrentKeeper() {
  return currentKeeper;
}

function setCurrentKeeper(name) {
  currentKeeper = name;
  saveAuthState();
}

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
  
  var removeBtn = div.querySelector('.remove-deceased-btn');
  removeBtn.addEventListener('click', function() {
    div.remove();
  });
  
  container.appendChild(div);
}

function getRegionImagePath(regionId) {
  return '/CHERTOGI_MAP/images/' + regionId;
}

function loadRegionImage(regionId) {
  var imgContainer = document.getElementById('region-image-placeholder');
  if (!imgContainer) return;
  
  imgContainer.textContent = '';
  imgContainer.style.display = 'flex';
  imgContainer.style.alignItems = 'center';
  imgContainer.style.justifyContent = 'center';
  imgContainer.style.overflow = 'hidden';
  imgContainer.style.backgroundColor = '#4a0e0e';
  
  var basePath = getRegionImagePath(regionId);
  var extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  var currentIndex = 0;
  
  function tryLoadNext() {
    if (currentIndex >= extensions.length) {
      imgContainer.style.backgroundImage = 'none';
      imgContainer.textContent = 'Нет изображения';
      imgContainer.style.color = 'rgba(255, 255, 255, 0.3)';
      imgContainer.style.fontSize = '14px';
      imgContainer.style.fontFamily = 'Philosopher, sans-serif';
      return;
    }
    
    var ext = extensions[currentIndex];
    var fullPath = basePath + ext;
    
    var img = new Image();
    img.onload = function() {
      imgContainer.style.backgroundImage = 'url(' + fullPath + ')';
      imgContainer.style.backgroundSize = 'cover';
      imgContainer.style.backgroundPosition = 'center';
      imgContainer.style.backgroundRepeat = 'no-repeat';
      imgContainer.textContent = '';
      console.log('Загружено изображение:', fullPath);
    };
    img.onerror = function() {
      currentIndex++;
      tryLoadNext();
    };
    img.src = fullPath;
  }
  
  tryLoadNext();
}

function openSidebar(regionId, name, description, difficulty) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name;
  sidebarDesc.textContent = description || 'Описание отсутствует';

  loadRegionImage(regionId);

  if (difficultyContainer) {
    if (difficulty !== undefined && difficulty !== null) {
      difficultyContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin: 12px 0 16px 0; padding: 8px 12px; background: rgba(74, 14, 14, 0.4); border-radius: 6px; border-left: 3px solid #4a0e0e;">
          <span style="color: #aaa; font-size: 14px; font-family: "Philosopher", sans-serif;">Сложность пути:</span>
          <span style="color: #ffd700; font-size: 18px; font-weight: 700; font-family: "Philosopher", sans-serif;">${difficulty}</span>
        </div>
      `;
    } else {
      difficultyContainer.innerHTML = '';
    }
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
  if (placementMode) {
    console.log('Режим размещения метки активен, сайдбар не закрывается');
    return;
  }
  
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  if (placementMode) {
    resetPlacementState();
  }
  closeSidebar();
});

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
          <input id="keeper-display" type="text" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border
