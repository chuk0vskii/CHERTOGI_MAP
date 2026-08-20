// ===== КЛИК ПО ИКОНКЕ (через forEachFeatureAtPixel) =====
map.on('click', function(event) {
  const pixel = event.pixel;

  const hit = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  }, {
    layerFilter: function(layer) {
      return layer === regionLayer;
    }
  });

  if (hit) {
    const regionId = hit.get('id');
    const name = hit.get('name');
    const desc = hit.get('description');
    openSidebar(regionId, name, desc);
  }
});
