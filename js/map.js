(function() {
  // Элементы
  const img = document.getElementById('mapImage');
  const wrapper = document.getElementById('mapWrapper');
  const markersContainer = document.getElementById('markersContainer');

  const infoPanel = document.getElementById('infoPanel');
  const infoTitle = document.getElementById('infoTitle');
  const infoDescription = document.getElementById('infoDescription');
  const infoClose = document.getElementById('infoClose');
  const overlay = document.getElementById('overlay');

  // Размеры карты
  const IMG_W = 9189;
  const IMG_H = 7026;

  // Состояние
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let minScale = 1;
  const MAX_SCALE = 2.0;

  // Обновление трансформации
  function update() {
    const transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.transform = transform;
    markersContainer.style.transform = transform;
  }

  // Центрирование
  function center() {
    const rect = wrapper.getBoundingClientRect();
    const sx = rect.width / IMG_W;
    const sy = rect.height / IMG_H;
    minScale = Math.min(sx, sy);
    scale = minScale;
    tx = (rect.width - IMG_W * scale) / 2;
    ty = (rect.height - IMG_H * scale) / 2;
    update();
  }

  // ===== ЗУМ (ИСПРАВЛЕННЫЙ) =====
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Определяем направление зума
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    let newScale = scale + delta;
    newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

    if (newScale === scale) return;

    // Координаты курсора в системе координат карты
    // НЕ делим на размеры карты!
    const px = (mouseX - tx) / scale;
    const py = (mouseY - ty) / scale;

    // Применяем новый масштаб
    scale = newScale;

    // Пересчитываем позицию, чтобы точка под курсором осталась на месте
    tx = mouseX - px * scale;
    ty = mouseY - py * scale;

    // Ограничения (чтобы карта не выходила за края)
    const maxX = rect.width - IMG_W * scale;
    const maxY = rect.height - IMG_H * scale;
    tx = Math.min(Math.max(tx, maxX), 0);
    ty = Math.min(Math.max(ty, maxY), 0);

    update();
  }, { passive: false });

  // ===== ПЕРЕТАСКИВАНИЕ =====
  let isDragging = false;
  let startX, startY, startTx, startTy;

  wrapper.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTx = tx;
    startTy = ty;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    tx = startTx + (e.clientX - startX);
    ty = startTy + (e.clientY - startY);

    const rect = wrapper.getBoundingClientRect();
    const maxX = rect.width - IMG_W * scale;
    const maxY = rect.height - IMG_H * scale;
    tx = Math.min(Math.max(tx, maxX), 0);
    ty = Math.min(Math.max(ty, maxY), 0);

    update();
  });

  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  // ===== МЕТКИ =====
  document.querySelectorAll('.marker').forEach(marker => {
    marker.addEventListener('click', function(e) {
      e.stopPropagation();
      const name = this.dataset.name || 'Без названия';
      const description = this.dataset.description || 'Описание отсутствует.';
      infoTitle.textContent = name;
      infoDescription.textContent = description;
      infoPanel.classList.add('open');
      overlay.classList.add('active');
    });
  });

  // ===== ЗАКРЫТИЕ ИНФО =====
  function closeInfo() {
    infoPanel.classList.remove('open');
    overlay.classList.remove('active');
  }
  infoClose.addEventListener('click', closeInfo);
  overlay.addEventListener('click', closeInfo);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInfo();
  });

  // ===== ЗАПУСК =====
  if (img.complete) {
    center();
  } else {
    img.addEventListener('load', center);
  }
  setTimeout(center, 500);

  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(center, 100);
  });

})();
