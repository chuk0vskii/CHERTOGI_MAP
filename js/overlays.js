// ===== КНОПКИ-ОВЕРЛЕИ =====
const markerOverlays = [];

function createMarkerOverlay(regionId, name, description, x, y) {
  const element = document.createElement('div');
  element.className = 'marker-button';
  element.innerHTML = `
    <img src="/CHERTOGI_MAP/icons/marker3.png" alt="${name}">
    <span class="marker-tooltip">${name}</span>
  `;

  const overlay = new ol.Overlay({
    element: element,
    position: [x, y],
    positioning: 'bottom-center',
    offset: [0, -8],
    stopEvent: false
  });

  element.addEventListener('click', function(e) {
    e.stopPropagation();
    if (typeof openSidebar === 'function') {
      openSidebar(regionId, name, description);
    } else {
      console.error('❌ Функция openSidebar не найдена!');
      alert(`📍 ${name}\n\n${description}`);
    }
  });

  map.addOverlay(overlay);
  markerOverlays.push(overlay);
}

async function loadMarkers() {
  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .eq('is_open', true); // ← ТОЛЬКО ОТКРЫТЫЕ

  if (error) {
    console.error('❌ Ошибка загрузки регионов:', error);
    return;
  }

  markerOverlays.forEach(overlay => map.removeOverlay(overlay));
  markerOverlays.length = 0;

  data.forEach(region => {
    createMarkerOverlay(
      region.id,
      region.name,
      region.description,
      region.x,
      region.y
    );
  });

  console.log(`✅ Загружено ${data.length} открытых регионов`);
}
