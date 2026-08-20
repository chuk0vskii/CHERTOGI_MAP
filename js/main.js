
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

// ===== КЛИК ПО РЕГИОНУ =====
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
    openSidebar(regionId, name, desc);
  }
});
