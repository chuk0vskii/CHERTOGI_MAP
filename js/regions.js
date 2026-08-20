// ===== РЕГИОНЫ КАК ИКОНКИ + НЕВИДИМАЯ ЗОНА ДЛЯ КЛИКА =====
let regionLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  zIndex: 5,
  style: function(feature) {
    const isHover = feature.get('hover') || false;
    const baseScale = 0.22;
    const scale = isHover ? baseScale * 1.3 : baseScale;

    // Радиус: было 20-25, стало 26-31 (+6)
    const baseRadius = 26;
    const hoverRadius = 31;

    // Смещение вверх: 10 пикселей
    const offsetY = 10;

    return [
      // Иконка
      new ol.style.Style({
        image: new ol.style.Icon({
          src: '/CHERTOGI_MAP/icons/marker3.png',
          scale: scale,
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        })
      }),
      // НЕВИДИМЫЙ КРУГ ДЛЯ КЛИКА (увеличен на 6, поднят на 10)
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: isHover ? hoverRadius : baseRadius,
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(255,255,255,0)',
            width: 0
          })
        }),
        geometry: function(feature) {
          const coords = feature.getGeometry().getCoordinates();
          // Смещаем круг вверх на 10 пикселей
          return new ol.geom.Point([coords[0], coords[1] + offsetY]);
        }
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
