
// ===== СЛОЙ РЕГИОНОВ =====
let regionLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  zIndex: 5,
  style: function(feature) {
    const name = feature.get('name') || '';
    const radius = feature.get('radius') || 350;
    const color = feature.get('color') || 'rgba(255, 215, 0, 0.25)';
    const borderColor = feature.get('borderColor') || 'rgba(255, 215, 0, 0.6)';

    return [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({ color: color }),
          stroke: new ol.style.Stroke({ color: borderColor, width: 2 })
        })
      }),
      new ol.style.Style({
        text: new ol.style.Text({
          text: name,
          font: 'bold 16px Arial',
          fill: new ol.style.Fill({ color: '#ffffff' }),
          stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.7)', width: 3 }),
          textAlign: 'center',
          textBaseline: 'middle'
        })
      })
    ];
  }
});

map.addLayer(regionLayer);

// ===== ЗАГРУЗКА РЕГИОНОВ ИЗ БАЗЫ =====
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
      radius: region.radius,
      color: region.color,
      borderColor: region.border_color
    });
  });

  regionLayer.getSource().addFeatures(features);
  console.log('✅ Регионы добавлены на карту');
}

loadRegions();
