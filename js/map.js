
(function() {
  // Получаем элементы
  const img = document.getElementById('mapImage');
  const wrapper = document.getElementById('mapWrapper');
  const markersContainer = document.getElementById('markersContainer');

  // Размеры карты
  const IMG_W = 9189;
  const IMG_H = 7026;

  // Переменные состояния
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let minScale = 1;
  const MAX_SCALE = 2;      // Максимальное увеличение
  const STEP = 0.1;         // Шаг зума

  // Функция обновления трансформации
  function update() {
    const transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.transform = transform;
    markersContainer.style.transform = transform;
  }

  // Функция центрирования карты
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

  // ===== ЗУМ ОТНОСИТЕЛЬНО КУРСОРА =====
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = wrapper.getBoundingClientRect();
    // Позиция курсора относительно контейнера
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Направление зума
    const delta = e.deltaY > 0 ? -STEP : STEP;
    let newScale = scale + delta;
    newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

    if (newScale === scale) return;

    // Координаты точки под курсором в системе координат карты
    const px = (mouseX - tx) / scale;
    const py = (mouseY - ty) / scale;

    // Применяем новый масштаб
    scale = newScale;

    // Пересчитываем позицию, чтобы точка под курсором осталась на месте
    tx = mouseX - px * scale;
    ty = mouseY - py * scale;

    // Ограничиваем перемещение (чтобы карта не выходила за края)
    const maxX = rect.width - IMG_W * scale;
    const maxY = rect.height - IMG_H * scale;
    tx = Math.min(Math.max(tx, maxX), 0);
    ty = Math.min(Math.max(ty, maxY), 0);

    update();
  }, { passive: false });

  // ===== ПЕРЕТАСКИВАНИЕ КАРТЫ =====
  let isDragging = false;
  let startX, startY, startTx, startTy;

  wrapper.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return; // Только левая кнопка
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

  // ===== ИНФОРМАЦИОННАЯ ПАНЕЛЬ =====
  document.querySelectorAll('.marker').forEach(marker => {
    marker.addEventListener('click', function(e) {
      e.stopPropagation();
      const name = this.dataset.name || 'Без названия';
      const description = this.dataset.description || 'Описание отсутствует.';
      document.getElementById('infoTitle').textContent = name;
      document.getElementById('infoDescription').textContent = description;
      document.getElementById('infoPanel').classList.add('open');
      document.getElementById('overlay').classList.add('active');
    });
  });

  function closeInfo() {
    document.getElementById('infoPanel').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
  }

  document.getElementById('infoClose').addEventListener('click', closeInfo);
  document.getElementById('overlay').addEventListener('click', closeInfo);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInfo();
  });

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  if (img.complete) {
    center();
  } else {
    img.addEventListener('load', center);
  }
  setTimeout(center, 500);

  // Пересчет при изменении размера окна
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(center, 100);
  });

})();
