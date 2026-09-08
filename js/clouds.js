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

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('❌ Ошибка загрузки облаков:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ Нет закрытых регионов');
    return;
  }

  // Сначала загружаем все изображения облаков в память
  const imagePromises = data.map(() => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = '/CHERTOGI_MAP/cloud3.png?v=' + Date.now();
    });
  });
  
  await Promise.all(imagePromises);
  console.log('📥 Все изображения облаков загружены в память');

  // Добавляем облака на карту
  data.forEach(region => {
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

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);
  });

  console.log(`✅ Добавлено ${data.length} облаков`);
  
  // Ждём отрисовки
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 100);
    });
  });
}

// НЕ ЗАПУСКАЕМ АВТОМАТИЧЕСКИ — loadClouds вызывается из main.js
// loadClouds();
