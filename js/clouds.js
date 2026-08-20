// ===== ОБЛАКА ДЛЯ ЗАКРЫТЫХ РЕГИОНОВ =====
const cloudLayers = [];

// ===== НАСТРОЙКИ РАЗМЕРА ОБЛАКА =====
const CLOUD_WIDTH = 600;
const CLOUD_HEIGHT = 400;

async function loadClouds() {
  // Удаляем старые облака
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('❌ Ошибка загрузки закрытых регионов:', error);
    return;
  }

  data.forEach(region => {
    // Используем cloud_x и cloud_y для облака
    const cx = region.cloud_x || region.x;  // если нет cloud_x — берём x
    const cy = region.cloud_y || region.y;

    const halfWidth = CLOUD_WIDTH / 2;
    const halfHeight = CLOUD_HEIGHT / 2;

    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/CHERTOGI_MAP/cloud.png?v=2',
        imageExtent: [
          cx - halfWidth,
          cy - halfHeight,
          cx + halfWidth,
          cy + halfHeight
        ],
        projection: 'PIXELS'
      }),
      zIndex: 15,
      opacity: 0.9
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);
  });

  console.log(`✅ Добавлено ${data.length} облаков для закрытых регионов`);
}
