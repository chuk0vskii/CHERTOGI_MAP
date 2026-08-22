// Clouds for closed regions
const cloudLayers = [];
const cloudOverlays = [];

const CLOUD_WIDTH = 1200;
const CLOUD_HEIGHT = 1200;

async function loadClouds() {
  cloudLayers.forEach(layer => map.removeLayer(layer));
  cloudLayers.length = 0;
  
  cloudOverlays.forEach(overlay => map.removeOverlay(overlay));
  cloudOverlays.length = 0;

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

    // ===== ОБЛАКО =====
    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now(),
        imageExtent: [
          cx - halfWidth,
          cy - halfHeight,
          cx + halfWidth,
          cy + halfHeight
        ],
        projection: 'PIXELS'
      }),
      zIndex: 15,
      opacity: 1.0
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);

    // ===== ТУЛТИП ДЛЯ ОБЛАКА =====
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'marker-button';
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.pointerEvents = 'auto';
    tooltipElement.style.cursor = 'default';
    tooltipElement.style.transform = 'translate(-50%, -50%)';
    tooltipElement.style.width = '1200px';
    tooltipElement.style.height = '1200px';
    tooltipElement.style.background = 'rgba(0,0,0,0)';
    
    const tooltip = document.createElement('span');
    tooltip.className = 'marker-tooltip';
    tooltip.textContent = 'Край еще не исследован';
    tooltip.style.position = 'absolute';
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transition = 'opacity 0.25s ease, visibility 0.25s ease';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.pointerEvents = 'none';
    
    tooltipElement.appendChild(tooltip);

    tooltipElement.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    tooltipElement.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });

    tooltipElement.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    const tooltipOverlay = new ol.Overlay({
      element: tooltipElement,
      position: [cx, cy],
      positioning: 'center-center',
      offset: [0, -30],
      stopEvent: true,
      zIndex: 20
    });

    map.addOverlay(tooltipOverlay);
    cloudOverlays.push(tooltipOverlay);

  }); // ← ЗАКРЫВАЕМ ЦИКЛ

  // ← ЛОГ ВНЕ ЦИКЛА
  console.log(`✅ Добавлено ${data.length} облаков с тултипами для закрытых регионов`);
}
