// ===== ОБЛАКА ДЛЯ ЗАКРЫТЫХ РЕГИОНОВ =====
const cloudLayers = [];

async function loadClouds() {
  // Удаляем старые облака
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false); // ← ТОЛЬКО ЗАКРЫТЫЕ

  if (error) {
    console.error('❌ Ошибка загрузки закрытых регионов:', error);
    return;
  }

  data.forEach(region => {
    // Создаём облако для каждого закрытого региона
    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: 'cloud.png',
        imageExtent: [
          region.x - 400,
          region.y - 300,
          region.x + 400,
          region.y + 300
        ],
        projection: 'PIXELS'
      }),
      zIndex: 10
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);
  });

  console.log(`✅ Добавлено ${data.length} облаков для закрытых регионов`);
}
