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

  // ===== КАРТА (ОДИН УРОВЕНЬ ЗУМА) =====
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          tileUrlFunction: function(tileCoord) {
            const z = tileCoord[0];
            const x = tileCoord[1];
            const y = tileCoord[2];

            // === ГЛАВНОЕ: ТОЛЬКО УРОВЕНЬ 0 ===
            if (z !== 0) return '';

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
      maxZoom: 1.5
    })
  });

  window.addEventListener('resize', function() {
    map.updateSize();
  });

  // ===== МЕТКИ =====
  if (typeof LOCATIONS !== 'undefined') {
    LOCATIONS.forEach(function(loc) {
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

      const icon = document.createElement('img');
      icon.src = loc.icon || 'https://cdn-icons-png.flaticon.com/512/1828/1828977.png';
      icon.style.cssText = 'width: 40px; height: 40px;';
      marker.appendChild(icon);

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

      marker.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
      });
      marker.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
      });

      marker.addEventListener('click', function(e) {
        e.stopPropagation();
        openInfo(loc.name, loc.description);
      });

      document.getElementById('map').appendChild(marker);
    });
  }

})();
