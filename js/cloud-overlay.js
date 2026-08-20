// ===== ОБЛАКО-ОВЕРЛЕЙ (картинка + невидимая зона) =====
(function() {
  const cloudExtent = [3950, -3590, 5150, -2500];
  const centerX = (cloudExtent[0] + cloudExtent[2]) / 2;
  const centerY = (cloudExtent[1] + cloudExtent[3]) / 2;
  
  const checkMap = setInterval(() => {
    if (typeof map !== 'undefined' && map.getTargetElement()) {
      clearInterval(checkMap);
      
      // ===== 1. НЕВИДИМАЯ ЗОНА ДЛЯ КЛИКА =====
      const clickElement = document.createElement('div');
      clickElement.style.position = 'absolute';
      clickElement.style.width = '1200px';   // ширина облака (подбери под свою картинку)
      clickElement.style.height = '1100px';  // высота облака
      clickElement.style.pointerEvents = 'auto';
      clickElement.style.cursor = 'default';
      clickElement.style.background = 'rgba(0,0,0,0)';
      
      // Тултип при наведении
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
      
      clickElement.appendChild(tooltip);
      
      clickElement.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        map.getTargetElement().style.cursor = 'default';
      });
      
      clickElement.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });
      
      clickElement.addEventListener('click', function(e) {
        e.stopPropagation();
        // Ничего не делаем
      });
      
      // ===== 2. ОВЕРЛЕЙ С КЛИКАБЕЛЬНОЙ ЗОНОЙ =====
      const clickOverlay = new ol.Overlay({
        element: clickElement,
        position: [centerX, centerY],
        positioning: 'center-center',
        offset: [0, 0],
        stopEvent: true // ← перехватывает клики у меток под облаком
      });
      
      map.addOverlay(clickOverlay);
      
      // ===== 3. САМА КАРТИНКА ОБЛАКА (уже есть в map.js) =====
      // Она остаётся как есть, просто добавляем поверх меток
      
      console.log('✅ Облако-оверлей с тултипом добавлено');
    }
  }, 500);
})();
