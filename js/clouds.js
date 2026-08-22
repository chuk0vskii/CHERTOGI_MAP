// Clouds for closed regions
const cloudLayers = [];
const cloudOverlays = [];

const CLOUD_WIDTH = 1200;
const CLOUD_HEIGHT = 1200;
const HIT_ZONE_PADDING = 300; // ← добавляем 300 пикселей к зоне активации

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

    // ===== ОБЛАКО (картинка) =====
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

    // ===== НЕВИДИМАЯ ЗОНА ДЛЯ НАВЕДЕНИЯ (увеличенная) =====
    const hitZoneWidth = CLOUD_WIDTH + HIT_ZONE_PADDING * 2;
    const hitZoneHeight = CLOUD_HEIGHT + HIT_ZONE_PADDING * 2;

    const overlayElement = document.createElement('div');
    overlayElement.style.position = 'absolute';
    overlayElement.style.width = hitZoneWidth + 'px';
    overlayElement.style.height = hitZoneHeight + 'px';
    overlayElement.style.pointerEvents = 'auto';
    overlayElement.style.cursor = 'default';
    overlayElement.style.background = 'rgba(0,0,0,0)'; // полностью прозрачный
    overlayElement.style.transform = 'translate(-50%, -50%)';
    overlayElement.style.zIndex = '20';
    
    // Тултип (как у маркеров)
    const tooltip = document.createElement('div');
    tooltip.textContent = 'Край еще не исследован';
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
    tooltip.style.zIndex = '20';
    tooltip.style.letterSpacing = '0.5px';

    // Стрелочка
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.top = '100%';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.border = '6px solid transparent';
    arrow.style.borderTopColor = 'rgba(0, 0, 0, 0.85)';
    tooltip.appendChild(arrow);
    overlayElement.appendChild(tooltip);

    // Показываем тултип при наведении на увеличенную зону
    overlayElement.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      tooltip.style.transform = 'translate(-50%, -50%) translateY(-8px)';
    });

    overlayElement.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.transform = 'translate(-50%, -50%)';
    });

    overlayElement.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    // Добавляем оверлей с увеличенной зоной
    const overlay = new ol.Overlay({
      element: overlayElement,
      position: [cx, cy],
      positioning: 'center-center',
      offset: [0, 0],
      stopEvent: true,
      zIndex: 20
    });

    map.addOverlay(overlay);
    cloudOverlays.push(overlay);
  });

  console.log(`✅ Добавлено ${data.length} облаков с зоной активации +${HIT_ZONE_PADDING}px`);
}
