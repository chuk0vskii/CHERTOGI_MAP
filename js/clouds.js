// ===== ОБЛАКА ДЛЯ ЗАКРЫТЫХ РЕГИОНОВ =====
const cloudLayers = [];

const CLOUD_SIZE = 1200;
const OFFSET_Y = -150;

async function loadClouds() {
  // Очищаем старые облака
  cloudLayers.forEach(layer => {
    try {
      map.removeLayer(layer);
    } catch(e) {
      // игнорируем
    }
  });
  cloudLayers.length = 0;

  console.log('☁️ Загрузка облаков...');

  // Проверяем, что карта существует
  if (typeof map === 'undefined' || !map) {
    console.error('❌ Карта не инициализирована');
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('❌ Ошибка загрузки облаков:', error);
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ Нет закрытых регионов');
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  // Добавляем облака
  data.forEach((region, index) => {
    try {
      const cx = Number(region.cloud_x || region.x || 0);
      const cy = Number(region.cloud_y || region.y || 0);

      if (isNaN(cx) || isNaN(cy)) {
        console.warn(`⚠️ Некорректные координаты для региона ${region.name || index}`);
        return;
      }

      const halfSize = CLOUD_SIZE / 2;
      const adjustedCy = cy + OFFSET_Y;

      const imageExtent = [
        cx - halfSize,
        adjustedCy - halfSize,
        cx + halfSize,
        adjustedCy + halfSize
      ];

      const cloudLayer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now() + '&' + index,
          imageExtent: imageExtent,
          projection: 'PIXELS'
        }),
        zIndex: 15,
        opacity: 1.0
      });

      map.addLayer(cloudLayer);
      cloudLayers.push(cloudLayer);

    } catch(e) {
      console.warn(`⚠️ Ошибка создания облака для ${region.name || index}:`, e.message);
    }
  });

  console.log(`✅ Добавлено ${cloudLayers.length} облаков`);

  // Показываем карту через 300ms
  setTimeout(function() {
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
  }, 300);
}

// Запускаем загрузку (но только если карта уже создана)
if (typeof map !== 'undefined' && map) {
  loadClouds();
} else {
  console.warn('⚠️ Карта ещё не создана, облака загрузятся позже');
  // Ждём карту
  let checkMap = setInterval(function() {
    if (typeof map !== 'undefined' && map) {
      clearInterval(checkMap);
      loadClouds();
    }
  }, 100);
}
