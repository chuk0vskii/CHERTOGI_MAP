// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

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
    
    // ===== ПОКАЗЫВАЕМ КАРТУ =====
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.classList.add('visible');
      mapEl.style.opacity = '1';
      console.log('✅ Класс visible добавлен');
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
      mapEl.style.opacity = '1';
    }
  }
}

// Запускаем после загрузки страницы
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
