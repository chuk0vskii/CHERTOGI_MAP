new ol.layer.Tile({
  source: new ol.source.XYZ({
    tileUrlFunction: function(tileCoord) {
      const x = tileCoord[1];
      const y = tileCoord[2];
      return `tiles4/tile_${y}_${x}.jpg`;
    },
    tileSize: 512,
    crossOrigin: 'anonymous'
  })
})
