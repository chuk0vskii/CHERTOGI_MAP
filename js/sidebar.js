// ===== БОКОВАЯ ПАНЕЛЬ =====
let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');

function openSidebar(regionId, name, description, imageUrl) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name;
  sidebarDesc.textContent = description || 'Описание отсутствует';

  const img = document.getElementById('region-image-placeholder');
  if (imageUrl) {
    img.style.backgroundImage = `url(${imageUrl})`;
    img.style.backgroundSize = 'cover';
    img.style.backgroundPosition = 'center';
    img.textContent = '';
  } else {
    img.style.backgroundImage = 'none';
    img.textContent = 'Изображение региона';
  }

  sidebar.style.display = 'block';
  sidebar.classList.add('open');
  
  setTimeout(() => { 
    sidebar.style.transform = 'translateX(0)'; 
  }, 10);
  
  loadReports(regionId);
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { 
    sidebar.style.display = 'none'; 
  }, 300);
}

// Закрытие по крестику
document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  closeSidebar();
});

// ===== ЗАКРЫТИЕ ПРИ КЛИКЕ НА КАРТУ (НО НЕ ПО МЕТКЕ) =====
function closeSidebarOnMapClick() {
  if (typeof map !== 'undefined') {
    map.on('click', function(event) {
      const pixel = event.pixel;
      const hit = map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
      });
      
      if (!hit) {
        const sidebar = document.getElementById('region-sidebar');
        if (sidebar && sidebar.style.display === 'block') {
          closeSidebar();
        }
      }
    });
  }
}

setTimeout(closeSidebarOnMapClick, 1000);
