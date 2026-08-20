// ===== ТОЧКА ВХОДА =====

// ===== ПОДСВЕТКА ПРИ НАВЕДЕНИИ (увеличение иконки) =====
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

  // Сбрасываем старый hover
  if (hoveredRegion) {
    hoveredRegion.set('hover', false);
  }

  // Устанавливаем новый
  if (hit && hit.getGeometry() instanceof ol.geom.Point) {
    hoveredRegion = hit;
    hoveredRegion.set('hover', true);
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    hoveredRegion = null;
    map.getTargetElement().style.cursor = '';
  }

  // Обновляем слой
  regionLayer.changed();
});

// ===== КЛИК ПО РЕГИОНУ (открывает сайдбар) =====
map.on('click', function(event) {
  const pixel = event.pixel;
  const hit = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  }, {
    layerFilter: function(layer) {
      return layer === regionLayer;
    }
  });

  if (hit && hit.getGeometry() instanceof ol.geom.Point) {
    const regionId = hit.get('id');
    const name = hit.get('name');
    const desc = hit.get('description');
    
    if (typeof openSidebar === 'function') {
      openSidebar(regionId, name, desc);
    } else {
      console.error('❌ Функция openSidebar не найдена!');
      alert(`📍 ${name}\n\n${desc}`);
    }
  }
});

// ===== ДОПОЛНИТЕЛЬНЫЙ ОБРАБОТЧИК (по координатам, для надёжности) =====
map.on('click', function(event) {
  const coordinate = event.coordinate;
  const features = regionLayer.getSource().getFeatures();

  let hitFeature = null;
  let minDist = Infinity;
  const clickRadius = 30;

  for (const feature of features) {
    const geom = feature.getGeometry();
    if (geom instanceof ol.geom.Point) {
      const geomCoords = geom.getCoordinates();
      const dx = coordinate[0] - geomCoords[0];
      const dy = coordinate[1] - geomCoords[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= clickRadius && dist < minDist) {
        minDist = dist;
        hitFeature = feature;
      }
    }
  }

  if (hitFeature && typeof openSidebar === 'function') {
    const regionId = hitFeature.get('id');
    const name = hitFeature.get('name');
    const desc = hitFeature.get('description');
    openSidebar(regionId, name, desc);
  }
});
