(function() {
  'use strict';

  // ===== ИНФО-ПАНЕЛЬ =====
  const infoPanel = document.getElementById('infoPanel');
  const infoTitle = document.getElementById('infoTitle');
  const infoDescription = document.getElementById('infoDescription');
  const infoClose = document.getElementById('infoClose');
  const overlay = document.getElementById('overlay');

  function openInfo(name, description) {
    infoTitle.textContent = name || 'Без названия';
    infoDescription.textContent = description || 'Описание отсутствует.';
    infoPanel.classList.add('open');
    overlay.classList.add('active');
  }

  function closeInfo() {
    infoPanel.classList.remove('open');
    overlay.classList.remove('active');
  }

  infoClose.addEventListener('click', closeInfo);
  overlay.addEventListener('click', closeInfo);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInfo();
  });

  // ===== КАРТА =====
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          tileUrlFunction: function(tileCoord) {
            const x = tileCoord[1];
            const y = tileCoord[2];
            // Ограничиваем, чтобы не выходить за 18×14
            if (x < 0 || x >= 18 || y < 0 || y >= 14) return '';
            return `tiles4/tile_${y}_${x}.jpg`;
          },
          tileSize: 512,
          crossOrigin: 'anonymous'
        })
      })
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 0.5,
      minZoom: 0.1,
      maxZoom: 2.5
    })
  });

  window.addEventListener('resize', function() {
    map.updateSize();
  });

  // ===== МЕТКИ =====
  // Проверяем, что массив LOCATIONS существует (из locations.js)
  if (typeof LOCATIONS !== 'undefined') {
    LOCATIONS.forEach(function(loc) {
      // Создаём контейнер метки
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.style.cssText = `
        position: absolute;
        left: ${loc.x}px;
        top: ${loc.y}px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        pointer-events: auto;
        z-index: 10;
      `;

      // Иконка
      const icon = document.createElement('img');
      icon.src = loc.icon || 'https://cdn-icons-png.flaticon.com/512/1828/1828977.png';
      icon.style.cssText = 'width: 40px; height: 40px;';
      marker.appendChild(icon);

      // Подсказка
      const tooltip = document.createElement('span');
      tooltip.className = 'marker-tooltip';
      tooltip.textContent = loc.name;
      tooltip.style.cssText = `
        position: absolute;
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        color: #ffd700;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        border: 1px solid rgba(255,215,0,0.2);
      `;
      marker.appendChild(tooltip);

      // Показ подсказки
      marker.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
      });
      marker.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
      });

      // Клик по метке
      marker.addEventListener('click', function(e) {
        e.stopPropagation();
        openInfo(loc.name, loc.description);
      });

      // Добавляем метку на карту
      document.getElementById('map').appendChild(marker);
    });
  }

})();
