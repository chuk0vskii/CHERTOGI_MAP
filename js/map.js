new ol.layer.Image({
  source: new ol.source.ImageStatic({
    url: 'tiles2/tile_01.jpg',
    imageSize: [9189, 7026],
    projection: 'EPSG:3857',
    imageExtent: [-9189/2, -7026/2, 9189/2, 7026/2]
  })
})
