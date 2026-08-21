// Clouds for closed regions
const cloudLayers = [];

// Cloud size settings
const CLOUD_WIDTH = 1200;
const CLOUD_HEIGHT = 1200;

async function loadClouds() {
  // Remove old clouds
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;

  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', false);

  if (error) {
    console.error('Error loading closed regions:', error);
    return;
  }

  data.forEach(region => {
    const cx = region.cloud_x || region.x;
    const cy = region.cloud_y || region.y;

    const halfWidth = CLOUD_WIDTH / 2;
    const halfHeight = CLOUD_HEIGHT / 2;

    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/CHERTOGI_MAP/cloud2.png?v=1',
        imageExtent: [
          cx - halfWidth,
          cy - halfHeight,
          cx + halfWidth,
          cy + halfHeight
        ],
        projection: 'PIXELS'
      }),
      zIndex: 15,
      opacity: 0.9
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);
  });

  console.log(`Added ${data.length} clouds for closed regions (cloud2.png)`);
}
