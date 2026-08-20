// ===== РЕГИОНЫ КАК ИКОНКИ =====
const REGION_ICON_SIZE = 24;

let regionLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  zIndex: 5,
  style: function(feature) {
    const name = feature.get('name') || '';
    const isHover = feature.get('hover') || false;

    const scale = isHover ? 0.85 : 0.65;

    return [
      // Иконка
      new ol.style.Style({
        image: new ol.style.Icon({
          src: '/CHERTOGI_MAP/icons/marker3.png?v=2', // ← добавил ?v=2
          scale: scale,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        })
      }),
      // Название региона
      new ol.style.Style({
        text: new ol.style.Text({
          text: name,
          font: isHover ? 'bold 14px Arial' : 'bold 12px Arial',
          fill: new ol.style.Fill({ color: '#ffffff' }),
          stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.8)', width: 4 }),
          textAlign: 'center',
          textBaseline: 'top',
          offsetY: isHover ? 14 : 10
        })
      })
    ];
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
