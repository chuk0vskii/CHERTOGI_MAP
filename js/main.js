// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

// Скрываем карту при загрузке (чтобы не было видно подгрузки)
document.getElementById('map').style.opacity = '0';

async function init() {
  try {
    // Загружаем облака (они должны быть первыми)
    // if (typeof loadClouds === 'function') {
    //   await loadClouds();
    //   console.log('✅ Облака загружены');
    // }
    
    // Загружаем маркеры
    if (typeof loadMarkers === 'function') {
      await loadMarkers();
      console.log('✅ Маркеры загружены');
    }
    
    // Загружаем админку
    if (typeof loadAdminRegions === 'function') {
      await loadAdminRegions();
    }
    
    // Показываем карту только после загрузки всего
    document.getElementById('map').style.opacity = '1';
    document.getElementById('map').style.transition = 'none';
    
    console.log('✅ Всё загружено! Карта показана.');
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    // Всё равно показываем карту, даже если ошибка
    document.getElementById('map').style.opacity = '1';
  }
}

// Запускаем после загрузки страницы
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
