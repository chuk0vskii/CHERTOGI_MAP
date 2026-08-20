// ===== ОБЛАКО КАК ОВЕРЛЕЙ (перехватывает клики) =====
function createCloudOverlay() {
  // Координаты облака (такие же, как в map.js)
  const cloudExtent = [3950, -3590, 5150, -2500];
  
  // Создаём HTML-элемент (невидимая зона)
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.width = '100%';
  element.style.height = '100%';
  element.style.pointerEvents = 'auto';
  element.style.cursor = 'default';
  element.style.background = 'rgba(0,0,0,0)'; // полностью прозрачный
  
  // При клике на облако — показываем сообщение
  element.addEventListener('click', function(e) {
    e.stopPropagation();
    alert('🌫️ Край еще не открыт');
  });
  
  // Создаём Overlay
  const overlay = new ol.Overlay({
    element: element,
    position: [
      (cloudExtent[0] + cloudExtent[2]) / 2,  // центр X
      (cloudExtent[1] + cloudExtent[3]) / 2   // центр Y
    ],
    positioning: 'center-center',
    offset: [0, 0],
    stopEvent: true // ← перехватывает клики, не даёт им дойти до меток
  });
  
  map.addOverlay(overlay);
  console.log('✅ Облако-оверлей добавлено (перехватывает клики)');
}

// Создаём облако после загрузки карты
setTimeout(() => {
  if (typeof map !== 'undefined') {
    createCloudOverlay();
  }
}, 500);
