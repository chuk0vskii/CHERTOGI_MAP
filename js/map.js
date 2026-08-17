  (function() {
    const container = document.getElementById('tileContainer');
    const markersContainer = document.getElementById('markersContainer');
    const wrapper = document.getElementById('mapWrapper');
    const infoPanel = document.getElementById('infoPanel');
    const infoTitle = document.getElementById('infoTitle');
    const infoDescription = document.getElementById('infoDescription');
    const infoClose = document.getElementById('infoClose');
    const overlay = document.getElementById('overlay');

    const COLS = 18;
    const ROWS = 14;
    const totalTiles = COLS * ROWS;
    const ORIGINAL_W = 9189;
    const ORIGINAL_H = 7026;

    // ===== ЗАГРУЗКА ТАЙЛОВ =====
    for (let i = 1; i <= totalTiles; i++) {
      const img = document.createElement('img');
      const padded = String(i).padStart(2, '0');
      img.src = `tiles2/tile_${padded}.jpg`;
      img.alt = `tile ${i}`;
      img.loading = 'lazy';
      container.appendChild(img);
    }

    // ===== СОСТОЯНИЕ =====
    let currentScale = 1;
    let tileSize = 0;
    let containerW = 0, containerH = 0;
    let posX = 0, posY = 0;
    let isDragging = false;
    let startX, startY, startPosX, startPosY;

    // ===== ВЫЧИСЛЕНИЕ РАЗМЕРА ТАЙЛОВ =====
    function fitTiles() {
      const rect = wrapper.getBoundingClientRect();
      const availableW = rect.width;
      const availableH = rect.height;

      const tileW = Math.floor(availableW / COLS);
      const tileH = Math.floor(availableH / ROWS);
      tileSize = Math.min(tileW, tileH);

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.style.width = tileSize + 'px';
        img.style.height = tileSize + 'px';
      });

      containerW = tileSize * COLS;
      containerH = tileSize * ROWS;
      container.style.width = containerW + 'px';
      container.style.height = containerH + 'px';

      // Центрируем
      const wrapperRect = wrapper.getBoundingClientRect();
      posX = (wrapperRect.width - containerW) / 2;
      posY = (wrapperRect.height - containerH) / 2;
      currentScale = 1;
      applyTransform();
    }

    // ===== ПРИМЕНЕНИЕ ТРАНСФОРМА =====
    function applyTransform() {
      const scale = currentScale;
      container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      markersContainer.style.transform = `scale(${tileSize / 512 * scale})`;
      markersContainer.style.transformOrigin = '0 0';
    }

    // ===== ЗУМ (от центра экрана) =====
    wrapper.addEventListener('wheel', function(e) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const newScale = Math.min(Math.max(currentScale + delta, 0.3), 2.5);

      if (newScale === currentScale) return;

      // Получаем размеры
      const wrapperRect = wrapper.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Центр экрана
      const cx = wrapperRect.left + wrapperRect.width / 2;
      const cy = wrapperRect.top + wrapperRect.height / 2;

      // Координаты центра экрана внутри контейнера (до зума)
      const px = (cx - containerRect.left) / currentScale;
      const py = (cy - containerRect.top) / currentScale;

      // Применяем новый масштаб
      currentScale = newScale;

      // Новое смещение, чтобы центр экрана остался на месте
      const newContainerRect = container.getBoundingClientRect();
      const newLeft = cx - px * currentScale;
      const newTop = cy - py * currentScale;

      // Пересчитываем posX и posY относительно контейнера
      posX = newLeft - wrapperRect.left;
      posY = newTop - wrapperRect.top;

      applyTransform();
    }, { passive: false });

    // ===== ПЕРЕТАСКИВАНИЕ =====
    wrapper.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = posX;
      startPosY = posY;
      wrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      posX = startPosX + (e.clientX - startX);
      posY = startPosY + (e.clientY - startY);
      applyTransform();
    });

    window.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        wrapper.style.cursor = 'grab';
      }
    });

    // ===== ЗАПУСК =====
    window.addEventListener('load', fitTiles);
    window.addEventListener('resize', fitTiles);

    // ===== КЛИК ПО МЕТКЕ =====
    document.querySelectorAll('.marker').forEach(marker => {
      marker.addEventListener('click', function(e) {
        e.stopPropagation();
        const name = this.dataset.name || 'Без названия';
        const desc = this.dataset.description || 'Описание отсутствует.';
        infoTitle.textContent = name;
        infoDescription.textContent = desc;
        infoPanel.classList.add('open');
        overlay.classList.add('active');
      });
    });

    // ===== ЗАКРЫТИЕ =====
    function closeInfo() {
      infoPanel.classList.remove('open');
      overlay.classList.remove('active');
    }
    infoClose.addEventListener('click', closeInfo);
    overlay.addEventListener('click', closeInfo);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeInfo();
    });

  })();
