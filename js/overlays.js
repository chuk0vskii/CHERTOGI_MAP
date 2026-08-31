// ============================================================
// МАРКЕРЫ РЕГИОНОВ (КНОПКИ НА КАРТЕ)
// ============================================================

const markerOverlays = [];

function createMarkerOverlay(regionId, name, description, x, y, difficulty) {
  const element = document.createElement('div');
  element.className = 'marker-button region-marker';
  element.innerHTML = `
    <img src="/CHERTOGI_MAP/icons/marker3.png" alt="${name}" width="24" height="24">
    <span class="marker-tooltip">${name}</span>
  `;

  // Увеличение при наведении
  element.addEventListener('mouseenter', function() {
    const img = this.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1.2)';
      img.style.transition = 'transform 0.2s ease';
    }
  });

  element.addEventListener('mouseleave', function() {
    const img = this.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1)';
    }
  });

  // Клик — открываем сайдбар
  element.addEventListener('click', function(e) {
    e.stopPropagation();
    if (typeof openSidebar === 'function') {
      openSidebar(regionId, name, description, difficulty);
    } else {
      console.error('❌ Функция openSidebar не найдена!');
      alert(`📍 ${name}\n\n${description}`);
    }
  });

  const overlay = new ol.Overlay({
    element: element,
    position: [x, y],
    positioning: 'bottom-center',
    offset: [0, -8],
    stopEvent: false
  });

  map.addOverlay(overlay);
  markerOverlays.push(overlay);
}

// ============================================================
// ЗАГРУЗКА МАРКЕРОВ РЕГИОНОВ
// ============================================================

async function loadMarkers() {
  try {
    const { data, error } = await _supabase
      .from('regions')
      .select('*')
      .eq('is_active', true)
      .eq('is_open', true);

    if (error) {
      console.error('❌ Ошибка загрузки регионов:', error);
      return;
    }

    // Очищаем старые маркеры
    markerOverlays.forEach(overlay => map.removeOverlay(overlay));
    markerOverlays.length = 0;

    // Создаём новые маркеры
    data.forEach(region => {
      createMarkerOverlay(
        region.id,
        region.name,
        region.description,
        region.x,
        region.y,
        region.difficulty
      );
    });

    console.log(`✅ Загружено ${data.length} открытых регионов`);
    
    // После загрузки маркеров регионов загружаем метки отчётов
    if (typeof loadReportMarkers === 'function') {
      await loadReportMarkers();
    }
    
  } catch (err) {
    console.error('❌ Ошибка загрузки маркеров:', err);
  }
}

// ============================================================
// ЗАПУСК
// ============================================================

// Загружаем маркеры после инициализации карты
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (typeof map !== 'undefined' && map) {
      loadMarkers();
    }
  }, 500);
});

// Перезагружаем маркеры при возвращении на страницу
window.addEventListener('focus', function() {
  if (typeof map !== 'undefined' && map) {
    loadMarkers();
  }
});
