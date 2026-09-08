// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

async function init() {
  try {
    // Сначала скрываем карту (на всякий случай)
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.style.opacity = '0';
      mapEl.classList.remove('visible');
    }
    
    // Загружаем облака
    if (typeof loadClouds === 'function') {
      console.log('☁️ Загрузка облаков...');
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
    
    // Ждём один кадр анимации для отрисовки
    await new Promise(resolve => requestAnimationFrame(resolve));
    // И ещё немного времени
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ПОКАЗЫВАЕМ КАРТУ
    if (mapEl) {
      mapEl.classList.add('visible');
      mapEl.style.opacity = '1';
      console.log('✅ Карта показана');
    }
    
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }
    
    console.log('✅ Всё загружено!');
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.classList.add('visible');
      mapEl.style.opacity = '1';
    }
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }
  }
}

// Запускаем после загрузки страницы
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
