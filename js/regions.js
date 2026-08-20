// ===== РЕГИОНЫ КАК ИКОНКИ =====
const REGION_ICON_SIZE = 24;

let regionLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  zIndex: 5,
  style: function(feature) {
    const isHover = feature.get('hover') || false;
    // Уменьшаем в 3 раза: 0.65 → 0.22 (0.65 / 3 ≈ 0.22)
    const baseScale = 0.22;
    const scale = isHover ? baseScale * 1.3 : baseScale;

    return new ol.style.Style({
      image: new ol.style.Icon({
        src: '/CHERTOGI_MAP/icons/marker3.png',
        scale: scale,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });
  }
});

map.addLayer(regionLayer);

// ===== ЗАГРУЗКА РЕГИОНОВ =====
async function loadRegions() {
  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Ошибка загрузки регионов:', error);
    return;
  }

  console.log(`✅ Загружено ${data.length} регионов`);

  const features = data.map(region => {
    return new ol.Feature({
      geometry: new ol.geom.Point([region.x, region.y]),
      id: region.id,
      name: region.name,
      description: region.description,
      hover: false
    });
  });

  regionLayer.getSource().addFeatures(features);
  console.log('✅ Регионы добавлены на карту');
}

loadRegions();
