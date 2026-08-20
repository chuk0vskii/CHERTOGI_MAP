// ===== РЕГИОНЫ КАК ИКОНКИ + НЕВИДИМЫЕ ПРЯМОУГОЛЬНИКИ ДЛЯ КЛИКА =====
const REGION_ICON_SIZE = 20;

let regionLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  zIndex: 5,
  style: function(feature) {
    const name = feature.get('name') || '';
    const isHover = feature.get('hover') || false;

    return [
      // Основная иконка
      new ol.style.Style({
        image: new ol.style.Icon({
          src: '/CHERTOGI_MAP/icons/marker2.png',
          scale: REGION_ICON_SIZE / 64,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        }),
        text: new ol.style.Text({
          text: name,
          font: 'bold 12px Arial',
          fill: new ol.style.Fill({ color: '#ffffff' }),
          stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.7)', width: 3 }),
          textAlign: 'center',
          textBaseline: 'bottom',
          offsetY: -8
        })
      }),
      // НЕВИДИМЫЙ ПРЯМОУГОЛЬНИК (для клика)
      new ol.style.Style({
        image: new ol.style.RegularShape({
          points: 4,
          radius: isHover ? 18 : 14, // чуть больше иконки
          angle: Math.PI / 4,
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0)' // полностью прозрачный
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(255,255,255,0)',
            width: 0
          })
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
