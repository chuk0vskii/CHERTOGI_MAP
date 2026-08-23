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
      console.warn('⚠️ Ошибка при удалении слоя:', e);
    }
  });
  cloudLayers.length = 0;

  console.log('☁️ Загрузка облаков...');

  // Проверяем, что карта инициализирована
  if (!map || typeof map.addLayer !== 'function') {
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

  // Если нет закрытых регионов — сразу показываем карту
  if (!data || data.length === 0) {
    console.log('✅ Нет закрытых регионов, облака не нужны');
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  // Добавляем облака на карту
  data.forEach((region, index) => {
    try {
      // Проверяем координаты
      const cx = region.cloud_x || region.x || 0;
      const cy = region.cloud_y || region.y || 0;

      // Проверяем, что координаты - числа
      if (typeof cx !== 'number' || typeof cy !== 'number') {
        console.warn(`⚠️ Некорректные координаты для региона ${region.name || index}`);
        return;
      }

      const halfSize = CLOUD_SIZE / 2;
      const adjustedCy = cy + OFFSET_Y;

      // Проверяем, что все значения корректны
      if (isNaN(cx) || isNaN(adjustedCy) || isNaN(halfSize)) {
        console.warn(`⚠️ Некорректные вычисления для региона ${region.name || index}`);
        return;
      }

      const imageExtent = [
        cx - halfSize,
        adjustedCy - halfSize,
        cx + halfSize,
        adjustedCy + halfSize
      ];

      // Проверяем, что extent корректен
      if (imageExtent.some(isNaN)) {
        console.warn(`⚠️ Некорректный extent для региона ${region.name || index}`);
        return;
      }

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
      console.warn(`⚠️ Ошибка при создании облака для ${region.name || index}:`, e);
    }
  });

  console.log(`✅ Добавлено ${cloudLayers.length} облаков из ${data.length} регионов`);

  // ===== ПОКАЗЫВАЕМ КАРТУ ЧЕРЕЗ НЕБОЛЬШУЮ ЗАДЕРЖКУ =====
  setTimeout(function() {
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
  }, 300);
}

// Запускаем загрузку облаков
loadClouds();
