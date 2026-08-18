(function() {
  'use strict';

  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          tileUrlFunction: function(tileCoord) {
            const x = tileCoord[1];
            const y = tileCoord[2];

            // === ГРАНИЦЫ: 18 СТОЛБЦОВ (0-17), 14 РЯДОВ (0-13) ===
            if (x < 0 || x >= 18 || y < 0 || y >= 14) return '';

            // === ТВОЯ НУМЕРАЦИЯ: РЯДЫ С 0, СТОЛБЦЫ С 1 ===
            const col = x + 1;
            return `tiles4/tile_${y}_${col}.jpg`;
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
