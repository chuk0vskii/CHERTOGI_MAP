// ===== КНОПКИ-ОВЕРЛЕИ (как у знакомого) =====
const markerOverlays = [];

function createMarkerOverlay(regionId, name, description, x, y) {
  // Создаём HTML-элемент кнопки
  const element = document.createElement('div');
  element.className = 'marker-button';
  element.innerHTML = `
    <img src="/CHERTOGI_MAP/icons/marker3.png" alt="${name}">
    <span class="marker-label">${name}</span>
  `;

  // Создаём Overlay
  const overlay = new ol.Overlay({
    element: element,
    position: [x, y],
    positioning: 'bottom-center',
    offset: [0, -10],
    stopEvent: false
  });

  // Обработчик клика (как у обычной кнопки!)
  element.addEventListener('click', function(e) {
    e.stopPropagation();
    openSidebar(regionId, name, description);
  });

  // Добавляем на карту
  map.addOverlay(overlay);
  markerOverlays.push(overlay);
}

// ===== ЗАГРУЗКА РЕГИОНОВ В ОВЕРЛЕИ =====
async function loadMarkers() {
  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Ошибка загрузки регионов:', error);
    return;
  }

  // Удаляем старые оверлеи
  markerOverlays.forEach(overlay => map.removeOverlay(overlay));
  markerOverlays.length = 0;

  // Создаём новые
  data.forEach(region => {
    createMarkerOverlay(
      region.id,
      region.name,
      region.description,
      region.x,
      region.y
    );
  });

  console.log(`✅ Загружено ${data.length} маркеров как оверлеи`);
}
