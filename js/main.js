// ===== ТОЧКА ВХОДА =====
// ВСЕ ФУНКЦИИ УЖЕ ОПРЕДЕЛЕНЫ В ФАЙЛАХ ВЫШЕ

// ===== ВЗАИМОДЕЙСТВИЕ С РЕГИОНАМИ =====
let hoveredRegion = null;

map.on('pointermove', function(event) {
  const pixel = event.pixel;
  const hit = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  }, {
    layerFilter: function(layer) {
      return layer === regionLayer;
    }
  });

  if (hoveredRegion) {
    hoveredRegion.set('hover', false);
  }

  if (hit && hit.getGeometry() instanceof ol.geom.Point) {
    hoveredRegion = hit;
    hoveredRegion.set('hover', true);
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    hoveredRegion = null;
    map.getTargetElement().style.cursor = '';
  }

  regionLayer.changed();
});

// ===== КЛИК ПО РЕГИОНУ (с проверкой попадания в круг) =====
map.on('click', function(event) {
  const coordinate = event.coordinate;

  // Проверяем, попал ли клик в какой-либо регион (с учётом радиуса)
  let hitFeature = null;
  let minDist = Infinity;

  const features = regionLayer.getSource().getFeatures();
  for (const feature of features) {
    const geom = feature.getGeometry();
    if (geom instanceof ol.geom.Point) {
      const dx = coordinate[0] - geom.getCoordinates()[0];
      const dy = coordinate[1] - geom.getCoordinates()[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = feature.get('radius') || REGION_RADIUS;
      if (dist <= radius && dist < minDist) {
        minDist = dist;
        hitFeature = feature;
      }
    }
  }

  if (hitFeature) {
    const regionId = hitFeature.get('id');
    const name = hitFeature.get('name');
    const desc = hitFeature.get('description');
    openSidebar(regionId, name, desc);
  }
});
