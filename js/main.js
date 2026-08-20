// ===== КЛИК ПО ИКОНКЕ =====
map.on('click', function(event) {
  const coordinate = event.coordinate;
  const features = regionLayer.getSource().getFeatures();

  let hitFeature = null;
  let minDist = Infinity;

  for (const feature of features) {
    const geom = feature.getGeometry();
    if (geom instanceof ol.geom.Point) {
      const dx = coordinate[0] - geom.getCoordinates()[0];
      const dy = coordinate[1] - geom.getCoordinates()[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      // зона клика = новый размер (20px) + запас 8px
      const clickRadius = 20 + 8;

      if (dist <= clickRadius && dist < minDist) {
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
