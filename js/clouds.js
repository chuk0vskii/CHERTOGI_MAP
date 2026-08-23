// ===== ОБЛАКА ДЛЯ ЗАКРЫТЫХ РЕГИОНОВ =====
const cloudLayers = [];

const CLOUD_SIZE = 1200;
const OFFSET_Y = -150;

async function loadClouds() {
  // Очищаем старые облака
  cloudLayers.forEach(layer => {
    try {
      map.removeLayer(layer);
    } catch(e) {}
  });
  cloudLayers.length = 0;

  console.log('☁️ Загрузка облаков...');

  // Проверяем карту
  if (typeof map === 'undefined' || !map) {
    console.error('❌ Карта не инициализирована');
    if (typeof window.showMap === 'function') window.showMap();
    return;
  }

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('❌ Ошибка загрузки облаков:', error);
    if (typeof window.showMap === 'function') window.showMap();
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ Нет закрытых регионов');
    if (typeof window.showMap === 'function') window.showMap();
    return;
  }

  // ===== ПРЕДЗАГРУЗКА ВСЕХ ИЗОБРАЖЕНИЙ =====
  console.log(`🔄 Предзагрузка ${data.length} облаков...`);
  
  const loadPromises = data.map((region, index) => {
    return new Promise((resolve) => {
      const cx = Number(region.cloud_x || region.x || 0);
      const cy = Number(region.cloud_y || region.y || 0);

      if (isNaN(cx) || isNaN(cy)) {
        console.warn(`⚠️ Некорректные координаты для ${region.name || index}`);
        resolve();
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

      // Создаём слой
      const cloudLayer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now(),
          imageExtent: imageExtent,
          projection: 'PIXELS'
        }),
        zIndex: 15,
        opacity: 1.0
      });

      // Ждём загрузки изображения
      const image = cloudLayer.getSource().getImage();
      if (image) {
        image.onload = function() {
          console.log(`✅ Облако ${index + 1}/${data.length} загружено`);
          // Добавляем слой только после загрузки
          map.addLayer(cloudLayer);
          cloudLayers.push(cloudLayer);
          resolve();
        };
        image.onerror = function() {
          console.warn(`⚠️ Ошибка загрузки облака ${index + 1}/${data.length}`);
          // Всё равно добавляем
          map.addLayer(cloudLayer);
          cloudLayers.push(cloudLayer);
          resolve();
        };
        
        // Если изображение уже загружено (кэш)
        if (image.complete) {
          console.log(`✅ Облако ${index + 1}/${data.length} из кэша`);
          map.addLayer(cloudLayer);
          cloudLayers.push(cloudLayer);
          resolve();
        }
      } else {
        resolve();
      }
    });
  });

  // Ждём загрузки ВСЕХ облаков
  await Promise.all(loadPromises);

  console.log(`✅ Загружено ${cloudLayers.length} облаков`);

  // ===== ПОКАЗЫВАЕМ КАРТУ ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ ВСЕХ ОБЛАКОВ =====
  if (typeof window.showMap === 'function') {
    window.showMap();
  }
}

// Запускаем загрузку
if (typeof map !== 'undefined' && map) {
  loadClouds();
} else {
  let checkMap = setInterval(function() {
    if (typeof map !== 'undefined' && map) {
      clearInterval(checkMap);
      loadClouds();
    }
  }, 100);
}
