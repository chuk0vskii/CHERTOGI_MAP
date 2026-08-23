// ===== ОБЛАКА ДЛЯ ЗАКРЫТЫХ РЕГИОНОВ =====
const cloudLayers = [];

const CLOUD_SIZE = 1200;
const OFFSET_Y = -150;

// Флаг, что облака загружены
let cloudsLoaded = false;

async function loadClouds() {
  // Очищаем старые облака
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;

  console.log('☁️ Загрузка облаков...');

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('❌ Ошибка загрузки облаков:', error);
    cloudsLoaded = true;
    // Даже если ошибка — показываем карту
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  // Если нет закрытых регионов — сразу показываем карту
  if (!data || data.length === 0) {
    console.log('✅ Нет закрытых регионов, облака не нужны');
    cloudsLoaded = true;
    if (typeof window.showMap === 'function') {
      window.showMap();
    }
    return;
  }

  // Создаём массив промисов для загрузки всех облаков
  const loadPromises = data.map((region) => {
    return new Promise((resolve) => {
      const cx = region.cloud_x || region.x;
      const cy = region.cloud_y || region.y;

      const halfSize = CLOUD_SIZE / 2;
      const adjustedCy = cy + OFFSET_Y;

      const cloudLayer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now(),
          imageExtent: [
            cx - halfSize,
            adjustedCy - halfSize,
            cx + halfSize,
            adjustedCy + halfSize
          ],
          projection: 'PIXELS'
        }),
        zIndex: 15,
        opacity: 1.0
      });

      // Ждём, пока изображение загрузится
      const image = cloudLayer.getSource().getImage();
      if (image) {
        image.onload = function() {
          console.log(`✅ Облако загружено: ${region.name}`);
          resolve();
        };
        image.onerror = function() {
          console.warn(`⚠️ Ошибка загрузки облака: ${region.name}`);
          resolve(); // Всё равно разрешаем, чтобы не блокировать
        };
      } else {
        resolve();
      }

      map.addLayer(cloudLayer);
      cloudLayers.push(cloudLayer);
    });
  });

  // Ждём загрузки ВСЕХ облаков
  await Promise.all(loadPromises);

  cloudsLoaded = true;
  console.log(`✅ Добавлено ${data.length} облаков`);

  // ===== ПОКАЗЫВАЕМ КАРТУ ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ ВСЕХ ОБЛАКОВ =====
  if (typeof window.showMap === 'function') {
    window.showMap();
  }
}

// Запускаем загрузку облаков
loadClouds();
