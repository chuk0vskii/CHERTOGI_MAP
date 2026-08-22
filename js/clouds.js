// Clouds for closed regions
const cloudLayers = [];
const cloudOverlays = [];

const CLOUD_SIZE = 120; // ← увеличен в 5 раз

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
    element.className = 'marker-button';
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
    img.style.transition = 'none'; // ← убираем анимацию
    
    element.appendChild(img);

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
    tooltip.style.display = 'inline-block';
    tooltip.style.maxWidth = 'none';
    
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
