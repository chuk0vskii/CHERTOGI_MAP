// Clouds for closed regions
const cloudLayers = [];
const cloudOverlays = [];

const CLOUD_SIZE = 200;

async function loadClouds() {
  // Удаляем старые облака и оверлеи
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

    const halfSize = CLOUD_SIZE / 2;

    // ===== 1. ОБЛАКО КАК СЛОЙ (масштабируется) =====
    const cloudLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/CHERTOGI_MAP/cloud3.png?v=' + Date.now(),
        imageExtent: [
          cx - halfSize,
          cy - halfSize,
          cx + halfSize,
          cy + halfSize
        ],
        projection: 'PIXELS'
      }),
      zIndex: 15,
      opacity: 1.0
    });

    map.addLayer(cloudLayer);
    cloudLayers.push(cloudLayer);

    // ===== 2. НЕВИДИМЫЙ ОВЕРЛЕЙ ДЛЯ ТУЛТИПА (НЕ БЛОКИРУЕТ КЛИКИ) =====
    const overlayElement = document.createElement('div');
    overlayElement.style.position = 'absolute';
    overlayElement.style.width = CLOUD_SIZE + 'px';
    overlayElement.style.height = CLOUD_SIZE + 'px';
    overlayElement.style.pointerEvents = 'auto';
    overlayElement.style.cursor = 'default';
    overlayElement.style.background = 'rgba(0,0,0,0)';
    overlayElement.style.transform = 'translate(-50%, -50%)';
    overlayElement.style.zIndex = '20';

    // Тултип
    const tooltip = document.createElement('div');
    tooltip.textContent = 'Край не исследован';
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
    tooltip.style.transition = 'opacity 0.25s ease, visibility 0.25s ease';
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

    // Показываем тултип при наведении
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

    // НЕ БЛОКИРУЕМ КЛИКИ!
    overlayElement.addEventListener('click', function(e) {
      // Ничего не делаем — клик проходит дальше
    });

    // Добавляем оверлей (без stopEvent)
    const overlay = new ol.Overlay({
      element: overlayElement,
      position: [cx, cy],
      positioning: 'center-center',
      offset: [0, 0],
      stopEvent: false, // ← НЕ БЛОКИРУЕМ КЛИКИ
      zIndex: 20
    });

    map.addOverlay(overlay);
    cloudOverlays.push(overlay);
  });

  console.log(`✅ Добавлено ${data.length} облаков (масштабируются, с тултипом)`);
}
