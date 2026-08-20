// ===== ТОЧКА ВХОДА =====

// ===== ПОДСВЕТКА ПРИ НАВЕДЕНИИ =====
let hoveredRegion = null;
const CLICK_RADIUS = 35; // ← увеличен радиус

map.on('pointermove', function(event) {
  const coordinate = event.coordinate;
  const features = regionLayer.getSource().getFeatures();

  let hitFeature = null;
  let minDist = Infinity;

  for (const feature of features) {
    const geom = feature.getGeometry();
    if (geom instanceof ol.geom.Point) {
      const geomCoords = geom.getCoordinates();
      const dx = coordinate[0] - geomCoords[0];
      const dy = coordinate[1] - geomCoords[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= CLICK_RADIUS && dist < minDist) {
        minDist = dist;
        hitFeature = feature;
      }
    }
  }

  if (hoveredRegion) {
    hoveredRegion.set('hover', false);
  }

  if (hitFeature) {
    hoveredRegion = hitFeature;
    hoveredRegion.set('hover', true);
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    hoveredRegion = null;
    map.getTargetElement().style.cursor = '';
  }

  regionLayer.changed();
});

// ===== КЛИК ПО РЕГИОНУ =====
map.on('click', function(event) {
  const coordinate = event.coordinate;
  const features = regionLayer.getSource().getFeatures();

  let hitFeature = null;
  let minDist = Infinity;

  for (const feature of features) {
    const geom = feature.getGeometry();
    if (geom instanceof ol.geom.Point) {
      const geomCoords = geom.getCoordinates();
      const dx = coordinate[0] - geomCoords[0];
      const dy = coordinate[1] - geomCoords[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      // ← увеличен радиус до 50 для клика
      if (dist <= 50 && dist < minDist) {
        minDist = dist;
        hitFeature = feature;
      }
    }
  }

  if (hitFeature) {
    const regionId = hitFeature.get('id');
    const name = hitFeature.get('name');
    const desc = hitFeature.get('description');
    
    if (typeof openSidebar === 'function') {
      openSidebar(regionId, name, desc);
    } else {
      console.error('❌ Функция openSidebar не найдена!');
      alert(`📍 ${name}\n\n${desc}`);
    }
  }
});
