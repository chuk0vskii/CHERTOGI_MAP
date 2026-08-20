// ===== КАРТА =====
var mapExtent = [0.00000000, -7026.00000000, 9189.00000000, -400.00000000];
var mapMinZoom = 0;
var mapMaxZoom = 5;
var mapMaxResolution = 1.00000000;
var tileExtent = [0.00000000, -7026.00000000, 9189.00000000, -400.00000000];
var tileWidth = 512;
var tileHeight = 512;

var mapResolutions = [];
for (var z = 0; z <= mapMaxZoom; z++) {
  mapResolutions.push(Math.pow(2, mapMaxZoom - z) * mapMaxResolution);
}

var mapTileGrid = new ol.tilegrid.TileGrid({
  tileSize: [tileWidth, tileHeight],
  extent: tileExtent,
  minZoom: mapMinZoom,
  resolutions: mapResolutions
});

var layer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: '<a href="https://www.maptiler.com/engine/">Rendered with MapTiler Engine</a>, non-commercial use only',
    projection: 'PIXELS',
    tileGrid: mapTileGrid,
    tilePixelRatio: 1.00000000,
    url: "TILES/{z}/{x}/{y}.webp",
    interpolate: true
  })
});

var map = new ol.Map({
  target: 'map',
  layers: [layer],
  view: new ol.View({
    projection: ol.proj.get('PIXELS'),
    extent: mapExtent,
    maxResolution: mapTileGrid.getResolution(mapMinZoom),
    constrainOnlyCenter: false,
    center: [9189 / 2, -7026 / 2],  // ← центр карты
    zoom: 2.2                       // ← начальный зум (чем меньше число, тем дальше)
  })
});

// ===== АДАПТАЦИЯ ПОД РАЗМЕР ЭКРАНА =====
setTimeout(function() {
  map.updateSize();
}, 200);

window.addEventListener('resize', function() {
  map.updateSize();
});
