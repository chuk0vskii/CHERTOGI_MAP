// Clouds for closed regions
const cloudLayers = [];

const CLOUD_SIZE = 1200;
const OFFSET_Y = -150; // ← поднятие вверх (отрицательное значение)

async function loadClouds() {
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('Error loading closed regions:', error);
    return;
  }

  data.forEach(region => {
    const cx = region.cloud_x || region.x;
    const cy = region.cloud_y || region.y;

    const halfSize = CLOUD_SIZE / 2;

    // Смещаем центр облака вверх
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

  console.log(`✅ Добавлено ${data.length} облаков (масштабируются с картой, подняты на ${Math.abs(OFFSET_Y)}px)`);
}
