// ===== ОБЛАКО-ОВЕРЛЕЙ (упрощённый) =====
(function() {
  const cloudExtent = [3950, -3590, 5150, -2500];
  const centerX = (cloudExtent[0] + cloudExtent[2]) / 2;
  const centerY = (cloudExtent[1] + cloudExtent[3]) / 2;
  
  // Ждём, пока карта загрузится
  const checkMap = setInterval(() => {
    if (typeof map !== 'undefined' && map.getTargetElement()) {
      clearInterval(checkMap);
      
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.width = '200px';
      element.style.height = '200px';
      element.style.pointerEvents = 'auto';
      element.style.cursor = 'pointer';
      element.style.background = 'rgba(255,0,0,0.1)'; // временно видимый
      element.style.border = '2px solid red';
      element.textContent = 'ОБЛАКО';
      element.style.color = 'red';
      element.style.fontSize = '20px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      
      element.addEventListener('click', function(e) {
        e.stopPropagation();
        alert('🌫️ Край еще не открыт');
      });
      
      const overlay = new ol.Overlay({
        element: element,
        position: [centerX, centerY],
        positioning: 'center-center',
        offset: [0, 0],
        stopEvent: true
      });
      
      map.addOverlay(overlay);
      console.log('✅ Облако-оверлей добавлено (временно видимое)');
    }
  }, 500);
})();
