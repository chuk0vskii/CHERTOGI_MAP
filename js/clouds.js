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

    // ===== ОБЛАКО КАК ОВЕРЛЕЙ (как иконки) =====
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.pointerEvents = 'auto';
    element.style.cursor = 'default';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.zIndex = '15';
    
    // Сама картинка облака
    const img = document.createElement('img');
    img.src = '/CHERTOGI_MAP/cloud3.png?v=' + Date.now();
    img.style.width = CLOUD_WIDTH + 'px';
    img.style.height = CLOUD_HEIGHT + 'px';
    img.style.display = 'block';
    img.style.pointerEvents = 'auto'; // ← чтобы картинка ловила события
    img.style.userSelect = 'none';
    img.draggable = false;
    
    element.appendChild(img);

    // ===== ТУЛТИП (как у маркеров) =====
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
    element.appendChild(tooltip);

    // ===== СОБЫТИЯ НАВЕДЕНИЯ (на картинку) =====
    img.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      tooltip.style.transform = 'translate(-50%, -50%) translateY(-8px)';
    });

    img.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.transform = 'translate(-50%, -50%)';
    });

    img.addEventListener('click', function(e) {
      e.stopPropagation();
      // Можно добавить действие, если нужно
    });

    // ===== ДОБАВЛЯЕМ ОВЕРЛЕЙ =====
    const overlay = new ol.Overlay({
      element: element,
      position: [cx, cy],
      positioning: 'center-center',
      offset: [0, 0],
      stopEvent: true,
      zIndex: 15
    });

    map.addOverlay(overlay);
    cloudOverlays.push(overlay);
  });

  console.log(`✅ Добавлено ${data.length} облаков как оверлеи с тултипами`);
}
