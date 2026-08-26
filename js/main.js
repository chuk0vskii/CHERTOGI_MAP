// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

// Скрываем карту при загрузке
document.getElementById('map').style.opacity = '0';

async function init() {
  try {
    // Загружаем облака
    if (typeof loadClouds === 'function') {
      await loadClouds();
      console.log('✅ Облака загружены');
    }
    
    // Загружаем маркеры
    if (typeof loadMarkers === 'function') {
      await loadMarkers();
      console.log('✅ Маркеры загружены');
    }
    
    // Загружаем админку
    if (typeof loadAdminRegions === 'function') {
      await loadAdminRegions();
    }
    
    // Показываем карту
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.classList.add('visible');
      mapEl.style.transition = 'none';
    }
    
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 800);
    }
    
    console.log('✅ Всё загружено! Карта показана.');
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.classList.add('visible');
      mapEl.style.transition = 'none';
    }
  }
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
