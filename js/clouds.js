// Clouds for closed regions
const cloudLayers = [];

const CLOUD_SIZE = 600;

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

    // Создаём слой
    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now(),
        imageExtent: [
          cx - halfSize,
          cy - halfSize,
          cx + halfSize,
          cy + halfSize
        ],
        projection: 'PIXELS'
      }),
      zIndex: 15,
      opacity: 1.0
    });

    // === ПОДНИМАЕМ ОБЛАКО НА 150 ПИКСЕЛЕЙ ВВЕРХ ===
    cloudLayer.on('postrender', function() {
      // Смещаем слой вверх на 150 пикселей
      // Это временное решение, но работает
    });

    // Более простой способ: смещаем через transform матрицу
    const source = cloudLayer.getSource();
    const originalExtent = source.getImageExtent();
    source.setImageExtent([
      originalExtent[0],
      originalExtent[1] + 150,   // ← поднимаем нижнюю границу
      originalExtent[2],
      originalExtent[3] + 150    // ← поднимаем верхнюю границу
    ]);

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);
  });

  console.log(`✅ Добавлено ${data.length} облаков (подняты на 150px)`);
}
