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
let isAuthorized = false;
let currentKeeper = '';

function isReportAuthorized() {
  return isAuthorized;
}

function setReportAuthorized(value) {
  isAuthorized = value;
  console.log('🔑 Статус доступа к отчётам:', isAuthorized ? '✅ Открыт' : '🔒 Закрыт');
}

function getCurrentKeeper() {
  return currentKeeper;
}

function setCurrentKeeper(name) {
  currentKeeper = name;
}

// ============================================================
// ОТКРЫТИЕ/ЗАКРЫТИЕ ПАНЕЛИ
// ============================================================

function openSidebar(regionId, name, description, difficulty) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name;
  sidebarDesc.textContent = description || 'Описание отсутствует';

  if (difficultyContainer) {
    if (difficulty !== undefined && difficulty !== null) {
      difficultyContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin: 12px 0 16px 0; padding: 8px 12px; background: rgba(74, 14, 14, 0.4); border-radius: 6px; border-left: 3px solid #4a0e0e;">
          <span style="color: #aaa; font-size: 14px; font-family: 'Philosopher', sans-serif;">Сложность пути:</span>
          <span style="color: #ffd700; font-size: 18px; font-weight: 700; font-family: 'Philosopher', sans-serif;">${difficulty}</span>
        </div>
      `;
    } else {
      difficultyContainer.innerHTML = '';
    }
  }

  const img = document.getElementById('region-image-placeholder');
  if (img) {
    img.style.backgroundImage = 'none';
    img.textContent = 'Изображение региона';
  }

  sidebar.style.display = 'block';
  sidebar.classList.add('open');
  setTimeout(function() { sidebar.style.transform = 'translateX(0)'; }, 10);
  loadReports(regionId);
  updateReportButton();
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(function() { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  closeSidebar();
});

// ============================================================
// ОБНОВЛЕНИЕ КНОПКИ ОТЧЁТА
// ============================================================

function updateReportButton() {
  var reportBtn = document.getElementById('report-btn');
  if (!reportBtn) return;
  
  if (isReportAuthorized()) {
    var keeper = getCurrentKeeper();
    reportBtn.textContent = keeper ? '📝 Составить отчёт (' + keeper + ')' : '📝 Составить отчёт';
    reportBtn.style.opacity = '1';
    reportBtn.style.cursor = 'pointer';
  } else {
    reportBtn.textContent = '🔑 Введите пароль для создания отчёта';
    reportBtn.style.opacity = '0.6';
    reportBtn.style.cursor = 'pointer';
  }
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ПАРОЛЯ
// ============================================================

var passwordModal = document.createElement('div');
passwordModal.id = 'password-modal';
passwordModal.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  justify-content: center;
  align-items: center;
`;
passwordModal.innerHTML = `
  <div style="background: #1a0a1a; border: 1px solid #4a0e0e; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; color: #ffffff; box-shadow: 0 8px 40px rgba(0,0,0,0.8);">
    <h3 style="font-family: 'Calypso', serif; color: #ffd700; text-align: center; margin-top: 0; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px;">🔑 Введите пароль</h3>
    <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 16px;">Введите пароль для доступа к созданию отчётов</p>
    <input id="password-input" type="password" placeholder="Введите пароль..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: 'Philosopher', sans-serif; box-sizing: border-box; font-size: 16px;">
    <input id="keeper-input" type="text" placeholder="Имя Хранителя узлов..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: 'Philosopher', sans-serif; box-sizing: border-box; font-size: 16px;">
    <div style="display: flex; gap: 10px;">
      <button id="password-submit-btn" style="flex: 1; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: 'Philosopher', sans-serif; font-weight: bold; transition: all 0.3s;">Подтвердить</button>
      <button id="password-cancel-btn" style="padding: 10px 20px; background: transparent; color: #888; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-family: 'Philosopher', sans-serif;">Отмена</button>
    </div>
    <div id="password-error" style="color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 8px; display: none;"></div>
  </div>
`;
document.body.appendChild(passwordModal);

var passwordInput = document.getElementById('password-input');
var keeperInput = document.getElementById('keeper-input');
var passwordSubmitBtn = document.getElementById('password-submit-btn');
var passwordCancelBtn = document.getElementById('password-cancel-btn');
var passwordError = document.getElementById('password-error');

// ============================================================
// ОБРАБОТЧИКИ МОДАЛКИ ПАРОЛЯ
// ============================================================

function openPasswordModal() {
  passwordInput.value = '';
  keeperInput.value = '';
  passwordError.style.display = 'none';
  passwordModal.style.display = 'flex';
  setTimeout(function() { passwordInput.focus(); }, 100);
}

function closePasswordModal() {
  passwordModal.style.display = 'none';
}

passwordSubmitBtn.addEventListener('click', function() {
  var inputPassword = passwordInput.value.trim();
  var keeperName = keeperInput.value.trim();

  if (!inputPassword) {
    passwordError.textContent = 'Введите пароль';
    passwordError.style.display = 'block';
    return;
  }

  if (!keeperName) {
    passwordError.textContent = 'Введите имя Хранителя узлов';
    passwordError.style.display = 'block';
    return;
  }

  if (inputPassword === REPORT_PASSWORD) {
    setReportAuthorized(true);
    setCurrentKeeper(keeperName);
    closePasswordModal();
    updateReportButton();
    
    var reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.textContent = '📝 Составить отчёт (' + keeperName + ')';
      reportBtn.style.opacity = '1';
      reportBtn.style.cursor = 'pointer';
    }
    alert('✅ Доступ получен! Хранитель: ' + keeperName);
  } else {
    passwordError.textContent = 'Неверный пароль';
    passwordError.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }
});

passwordCancelBtn.addEventListener('click', closePasswordModal);
passwordModal.addEventListener('click', function(e) {
  if (e.target === this) closePasswordModal();
});

passwordInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') keeperInput.focus();
});
keeperInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') passwordSubmitBtn.click();
});

// ============================================================
// МОДАЛЬНОЕ ОКНО ОТЧЁТА
// ============================================================

var modal = document.getElementById('report-modal');
var modalRegionName = document.getElementById('modal-region-name');
var reportContent = document.getElementById('report-content');
var reportDeceasedContainer = document.getElementById('deceased-container');
var reportResourcesContainer = document.getElementById('resources-container');
var addDeceasedBtn = document.getElementById('add-deceased-btn');
var addResourceBtn = document.getElementById('add-resource-btn');
var keeperDisplay = document.getElementById('keeper-display');

var deceasedCount = 0;
var resourceCount = 0;

// ============================================================
// ДОБАВЛЕНИЕ ПОЛЯ ДЛЯ УМЕРШЕГО
// ============================================================

function addDeceasedField() {
  deceasedCount++;
  var div = document.createElement('div');
  div.className = 'deceased-field';
  div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
  div.innerHTML = `
    <input type="text" class="deceased-name" placeholder="Имя умершего персонажа..." style="flex:1; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: 'Philosopher', sans-serif; box-sizing: border-box; font-size: 14px;">
    <button class="remove-deceased-btn" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: 18px; padding: 0 8px;">✕</button>
  `;
  
  var removeBtn = div.querySelector('.remove-deceased-btn');
  removeBtn.addEventListener('click', function() {
    div.remove();
    deceasedCount--;
  });
  
  reportDeceasedContainer.appendChild(div);
}

// ============================================================
// ДОБАВЛЕНИЕ ПОЛЯ ДЛЯ РЕСУРСА
// ============================================================

function addResourceField() {
  resourceCount++;
  var div = document.createElement('div');
  div.className = 'resource-field';
  div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
  div.innerHTML = `
    <select class="resource-type
