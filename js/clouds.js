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
    // ===== БЕРЁМ КООРДИНАТЫ ОБЛАКА =====
    const cx = region.cloud_x || region.x;
    const cy = region.cloud_y || region.y;

    console.log(`☁️ ${region.name} → центр облака: (${cx}, ${cy})`); // ← проверка

    const halfWidth = CLOUD_WIDTH / 2;
    const halfHeight = CLOUD_HEIGHT / 2;

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
      zIndex: 15
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);

    // ===== ТУЛТИП =====
    const tooltipElement = document.createElement('div');
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.width = '100%';
    tooltipElement.style.height = '100%';
    tooltipElement.style.pointerEvents = 'auto';
    tooltipElement.style.cursor = 'default';
    tooltipElement.style.background = 'rgba(0,0,0,0)';

    const tooltip = document.createElement('div');
    tooltip.textContent = '🌫️ Край еще не исследован';
    tooltip.style.position = 'absolute';
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
    tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
    tooltip.style.color = '#ffffff';
    tooltip.style.padding = '6px 16px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '14px';
    tooltip.style.fontWeight = '700';
    tooltip.style.fontFamily = "'Philosopher', 'Arial', sans-serif";
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.border = '1px solid rgba(255, 215, 0, 0.15)';
    tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transition = 'opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease';

    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.top = '100%';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.border = '6px solid transparent';
    arrow.style.borderTopColor = 'rgba(0, 0, 0, 0.85)';
    tooltip.appendChild(arrow);
    tooltipElement.appendChild(tooltip);

    tooltipElement.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      tooltip.style.transform = 'translate(-50%, -50%) translateY(-8px)';
    });

    tooltipElement.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.transform = 'translate(-50%, -50%)';
    });

    tooltipElement.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    const tooltipOverlay = new ol.Overlay({
      element: tooltipElement,
      position: [cx, cy],
      positioning: 'center-center',
      offset: [0, 0],
      stopEvent: true
    });

    map.addOverlay(tooltipOverlay);
    cloudOverlays.push(tooltipOverlay);
  });

  console.log(`✅ Добавлено ${data.length} облаков для закрытых регионов`);
}
