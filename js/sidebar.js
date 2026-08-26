// ============================================================
// БОКОВАЯ ПАНЕЛЬ
// ============================================================

import { loadReports, submitReport, checkPassword, isReportAuthorized } from './reports.js';

let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');
const difficultyContainer = document.getElementById('region-difficulty');

// ============================================================
// ОТКРЫТИЕ ПАНЕЛИ
// ============================================================

export function openSidebar(regionId, name, description, difficulty) {
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
  setTimeout(() => { sidebar.style.transform = 'translateX(0)'; }, 10);
  loadReports(regionId);
  updateReportButton();
}

export function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

// ============================================================
// ОБНОВЛЕНИЕ КНОПКИ ОТЧЁТА
// ============================================================

function updateReportButton() {
  const reportBtn = document.getElementById('report-btn');
  if (!reportBtn) return;
  
  if (isReportAuthorized()) {
    reportBtn.textContent = '📝 Составить отчёт';
    reportBtn.style.opacity = '1';
    reportBtn.style.cursor = 'pointer';
  } else {
    reportBtn.textContent = '🔒 Введите пароль для создания отчёта';
    reportBtn.style.opacity = '0.6';
    reportBtn.style.cursor = 'pointer';
  }
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ПАРОЛЯ
// ============================================================

const passwordModal = document.createElement('div');
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
    <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 16px;">Введите пароль, чтобы получить доступ к созданию отчётов</p>
    <input id="password-input" type="password" placeholder="Введите пароль..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: 'Philosopher', sans-serif; box-sizing: border-box; font-size: 16px;">
    <div style="display: flex; gap: 10px;">
      <button id="password-submit-btn" style="flex: 1; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: 'Philosopher', sans-serif; font-weight: bold; transition: all 0.3s;">Подтвердить</button>
      <button id="password-cancel-btn" style="padding: 10px 20px; background: transparent; color: #888; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-family: 'Philosopher', sans-serif;">Отмена</button>
    </div>
    <div id="password-error" style="color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 8px; display: none;"></div>
  </div>
`;
document.body.appendChild(passwordModal);

const passwordInput = document.getElementById('password-input');
const passwordSubmitBtn = document.getElementById('password-submit-btn');
const passwordCancelBtn = document.getElementById('password-cancel-btn');
const passwordError = document.getElementById('password-error');

// ============================================================
// ОБРАБОТЧИКИ МОДАЛКИ ПАРОЛЯ
// ============================================================

function openPasswordModal() {
  passwordInput.value = '';
  passwordError.style.display = 'none';
  passwordModal.style.display = 'flex';
  setTimeout(() => passwordInput.focus(), 100);
}

function closePasswordModal() {
  passwordModal.style.display = 'none';
}

passwordSubmitBtn.addEventListener('click', function() {
  const inputPassword = passwordInput.value.trim();
  if (!inputPassword) {
    passwordError.textContent = 'Введите пароль';
    passwordError.style.display = 'block';
    return;
  }

  const result = checkPassword(inputPassword);
  if (result.success) {
    closePasswordModal();
    updateReportButton();
    // Если панель открыта — обновляем кнопку
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.textContent = '📝 Составить отчёт';
      reportBtn.style.opacity = '1';
      reportBtn.style.cursor = 'pointer';
    }
    alert('✅ Доступ к отчётам получен!');
  } else {
    passwordError.textContent = result.error;
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
  if (e.key === 'Enter') passwordSubmitBtn.click();
});

// ============================================================
// КЛИК ПО КНОПКЕ "СОСТАВИТЬ ОТЧЁТ"
// ============================================================

document.getElementById('report-btn')?.addEventListener('click', function() {
  // Если авторизован — открываем модалку отчёта
  if (isReportAuthorized()) {
    if (!currentRegionId) return;
    const regionName = sidebarTitle.textContent;
    document.getElementById('modal-region-name').textContent = `📍 Регион: ${regionName}`;
    document.getElementById('report-author').value = '';
    document.getElementById('report-content').value = '';
    document.getElementById('report-modal').style.display = 'flex';
  } else {
    // Если не авторизован — открываем модалку пароля
    openPasswordModal();
  }
});

// ============================================================
// МОДАЛЬНОЕ ОКНО ОТЧЁТА
// ============================================================

const modal = document.getElementById('report-modal');
const modalRegionName = document.getElementById('modal-region-name');
const reportAuthor = document.getElementById('report-author');
const reportContent = document.getElementById('report-content');

export function closeModal() {
  modal.style.display = 'none';
}

document.getElementById('cancel-report-btn')?.addEventListener('click', closeModal);
modal?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('submit-report-btn')?.addEventListener('click', async function() {
  // Двойная проверка — вдруг сессия истекла
  if (!isReportAuthorized()) {
    alert('Доступ к отчётам запрещён. Введите пароль.');
    closeModal();
    openPasswordModal();
    return;
  }
  
  const content = reportContent.value.trim();
  const author = reportAuthor.value.trim();

  if (!content) {
    alert('Напишите текст отчёта');
    return;
  }

  const result = await submitReport(currentRegionId, content, author);
  
  if (result.success) {
    alert('✅ Отчёт сохранён!');
    closeModal();
    loadReports(currentRegionId);
  } else {
    alert('❌ Ошибка: ' + result.error);
  }
});

// ============================================================
// ЗАКРЫТИЕ ПРИ КЛИКЕ НА КАРТУ
// ============================================================

export function closeSidebarOnMapClick() {
  if (typeof map !== 'undefined') {
    map.on('click', function(event) {
      const target = event.originalEvent.target;
      const isOverlay = target.closest('.ol-overlay-container') !== null;
      
      if (!isOverlay) {
        const sidebar = document.getElementById('region-sidebar');
        if (sidebar && sidebar.style.display === 'block') {
          closeSidebar();
        }
      }
    });
  }
}

setTimeout(closeSidebarOnMapClick, 1000);
