// ===== БОКОВАЯ ПАНЕЛЬ =====
let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');
const difficultyContainer = document.getElementById('region-difficulty');

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
  setTimeout(() => { sidebar.style.transform = 'translateX(0)'; }, 10);
  loadReports(regionId);
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  closeSidebar();
});

// ===== ЗАКРЫТИЕ ПРИ КЛИКЕ НА КАРТУ (НО НЕ ПО ОВЕРЛЕЮ) =====
function closeSidebarOnMapClick() {
  if (typeof map !== 'undefined') {
    map.on('click', function(event) {
      // Проверяем, не был ли клик по оверлею (маркеру)
      const target = event.originalEvent.target;
      const isOverlay = target.closest('.ol-overlay-container') !== null;
      
      // Если клик не по оверлею — закрываем панель
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
