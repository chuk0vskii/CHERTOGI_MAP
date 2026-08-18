(function() {
  'use strict';

  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          tileUrlFunction: function(tileCoord) {
            // === ВСЕГДА ВОЗВРАЩАЕМ ОДИН ТАЙЛ ===
            return 'tiles4/tile_0_1.jpg';
          },
          tileSize: 512,
          crossOrigin: 'anonymous'
        })
      })
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 0.5,
      minZoom: 0.1,
      maxZoom: 2.5
    })
  });

  window.addEventListener('resize', function() {
    map.updateSize();
  });

})();
