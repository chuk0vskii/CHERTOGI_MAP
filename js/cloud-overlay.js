// ===== ОБЛАКО-ОВЕРЛЕЙ С ТУЛТИПОМ =====
(function() {
  const cloudExtent = [3950, -3590, 5150, -2500];
  const centerX = (cloudExtent[0] + cloudExtent[2]) / 2;
  const centerY = (cloudExtent[1] + cloudExtent[3]) / 2;
  
  // Ждём, пока карта загрузится
  const checkMap = setInterval(() => {
    if (typeof map !== 'undefined' && map.getTargetElement()) {
      clearInterval(checkMap);
      
      // Создаём элемент-контейнер
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.width = '400px';      // ширина облака
      element.style.height = '300px';     // высота облака
      element.style.pointerEvents = 'auto';
      element.style.cursor = 'default';
      element.style.background = 'rgba(0,0,0,0)'; // полностью прозрачный
      
      // Создаём тултип (подсказка)
      const tooltip = document.createElement('div');
      tooltip.textContent = '🌫️ Край еще не открыт';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
      tooltip.style.color = '#ffffff';
      tooltip.style.padding = '10px 24px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.fontSize = '16px';
      tooltip.style.fontWeight = 'bold';
      tooltip.style.fontFamily = "'Philosopher', 'Arial', sans-serif";
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.border = '1px solid rgba(255, 215, 0, 0.2)';
      tooltip.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.6)';
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
      
      // Добавляем тултип в элемент
      element.appendChild(tooltip);
      
      // При наведении — показываем тултип
      element.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        map.getTargetElement().style.cursor = 'default';
      });
      
      element.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });
      
      // При клике — ничего не происходит (или можно оставить сообщение)
      element.addEventListener('click', function(e) {
        e.stopPropagation();
        // Ничего не делаем, просто тултип
      });
      
      // Создаём Overlay
      const overlay = new ol.Overlay({
        element: element,
        position: [centerX, centerY],
        positioning: 'center-center',
        offset: [0, 0],
        stopEvent: true // перехватывает клики
      });
      
      map.addOverlay(overlay);
      console.log('✅ Облако-оверлей с тултипом добавлено');
    }
  }, 500);
})();
