// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

// Функция предзагрузки изображений
function preloadImages(urls) {
  return Promise.all(urls.map(url => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = url;
    });
  }));
}

async function init() {
  try {
    // 1. Предзагружаем изображение облака в память
    console.log('📥 Предзагрузка облаков...');
    await preloadImages(['/CHERTOGI_MAP/cloud3.png']);
    console.log('✅ Облака предзагружены');
    
    // 2. Загружаем облака на карту
    if (typeof loadClouds === 'function') {
      console.log('☁️ Загрузка облаков на карту...');
      await loadClouds();
      console.log('✅ Облака загружены на карту');
    }
    
    // 3. Загружаем маркеры
    if (typeof loadMarkers === 'function') {
      await loadMarkers();
      console.log('✅ Маркеры загружены');
    }
    
    // 4. Загружаем админку
    if (typeof loadAdminRegions === 'function') {
      await loadAdminRegions();
    }
    
    // 5. ДАЁМ КАРТЕ ВРЕМЯ НА ОТРИСОВКУ ОБЛАКОВ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 6. ПОКАЗЫВАЕМ КАРТУ
    const mapEl = document.getElementById('map');
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
      }, 800);
    }
    
    console.log('✅ Всё загружено!');
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    // В случае ошибки всё равно показываем карту
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
      }, 800);
    }
  }
}

// Запускаем после загрузки страницы
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
