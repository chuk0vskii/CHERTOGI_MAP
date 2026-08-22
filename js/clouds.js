// Clouds for closed regions
const cloudLayers = [];
const cloudOverlays = [];

const CLOUD_SIZE = 160; // ← 240 / 1.5 = 160

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

    const element = document.createElement('div');
    element.className = 'cloud-marker';
    element.style.position = 'absolute';
    element.style.pointerEvents = 'auto';
    element.style.cursor = 'default';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.zIndex = '15';
    
    const img = document.createElement('img');
    img.src = '/CHERTOGI_MAP/cloud3.png?v=' + Date.now();
    img.style.width = CLOUD_SIZE + 'px';
    img.style.height = CLOUD_SIZE + 'px';
    img.style.display = 'block';
    img.style.pointerEvents = 'auto';
    img.style.userSelect = 'none';
    img.draggable = false;
    
    element.appendChild(img);

    // ===== ТУЛТИП КАК У МЕТОК =====
    const tooltip = document.createElement('span');
    tooltip.className = 'marker-tooltip';
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
    tooltip.style.transition = 'opacity 0.25s ease, visibility 0.25s ease';
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

    element.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    element.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });

    element.addEventListener('click', function(e) {
      e.stopPropagation();
    });

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

  console.log(`✅ Добавлено ${data.length} облаков (размер ${CLOUD_SIZE}px)`);
}
