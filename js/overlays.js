// ===== КНОПКИ-ОВЕРЛЕИ =====
const markerOverlays = [];

// ===== КООРДИНАТЫ ОБЛАКА =====
const CLOUD_EXTENT = [3950, -3590, 5150, -2500];

// ===== ФУНКЦИЯ ПРОВЕРКИ: находится ли точка под облаком =====
function isUnderCloud(x, y) {
  return x >= CLOUD_EXTENT[0] && 
         x <= CLOUD_EXTENT[2] && 
         y >= CLOUD_EXTENT[1] && 
         y <= CLOUD_EXTENT[3];
}

function createMarkerOverlay(regionId, name, description, x, y) {
  // Если метка под облаком — НЕ СОЗДАЁМ её
  if (isUnderCloud(x, y)) {
    console.log(`🌫️ Метка "${name}" скрыта облаком`);
    return;
  }

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
    .eq('is_active', true);

  if (error) {
    console.error('❌ Ошибка загрузки регионов:', error);
    return;
  }

  // Очищаем старые оверлеи
  markerOverlays.forEach(overlay => map.removeOverlay(overlay));
  markerOverlays.length = 0;

  // Создаём метки только для регионов вне облака
  data.forEach(region => {
    createMarkerOverlay(
      region.id,
      region.name,
      region.description,
      region.x,
      region.y
    );
  });

  console.log(`✅ Загружено ${markerOverlays.length} маркеров (${data.length - markerOverlays.length} скрыто облаком)`);
}
