
(function() {
  'use strict';

  const img = document.getElementById('mapImage');
  const container = document.getElementById('container');
  const markersContainer = document.getElementById('markersContainer');
  const wrapper = document.getElementById('mapWrapper');
  const loader = document.getElementById('loader');
  const infoPanel = document.getElementById('infoPanel');
  const infoTitle = document.getElementById('infoTitle');
  const infoDescription = document.getElementById('infoDescription');
  const infoClose = document.getElementById('infoClose');
  const overlay = document.getElementById('overlay');

  // ===== РАЗМЕРЫ КАРТЫ =====
  const IMG_W = 9189;
  const IMG_H = 7026;

  // ===== СОСТОЯНИЕ =====
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let minScale = 1;
  const MAX_SCALE = 6.0;
  const STEP = 0.3;

  // ===== ПРИМЕНЕНИЕ ТРАНСФОРМАЦИИ =====
  function applyTransform() {
    const transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    container.style.transform = transform;
    markersContainer.style.transform = `scale(${scale})`;
    markersContainer.style.transformOrigin = '0 0';
  }

  // ===== ОГРАНИЧЕНИЕ ПЕРЕМЕЩЕНИЯ =====
  function constrain() {
    const wrapperRect = wrapper.getBoundingClientRect();
    const imgW = IMG_W * scale;
    const imgH = IMG_H * scale;

    const maxX = Math.max(0, imgW - wrapperRect.width);
    const maxY = Math.max(0, imgH - wrapperRect.height);

    tx = Math.min(Math.max(tx, -maxX / 2), maxX / 2);
    ty = Math.min(Math.max(ty, -maxY / 2), maxY / 2);
  }

  // ===== ЦЕНТРИРОВАНИЕ =====
  function centerMap() {
    const wrapperRect = wrapper.getBoundingClientRect();
    const scaleX = wrapperRect.width / IMG_W;
    const scaleY = wrapperRect.height / IMG_H;
    minScale = Math.min(scaleX, scaleY);
    scale = minScale;
    tx = 0;
    ty = 0;
    applyTransform();
    constrain();
    applyTransform();
  }

  // ===== ЗУМ ПОД КУРСОРОМ =====
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -STEP : STEP;
    let newScale = scale + delta;
    newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

    if (newScale === scale) return;

    const px = (mouseX - tx) / scale;
    const py = (mouseY - ty) / scale;

    scale = newScale;
    tx = mouseX - px * scale;
    ty = mouseY - py * scale;

    constrain();
    applyTransform();
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
    constrain();
    applyTransform();
  });

  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  // ===== ЗАГРУЗКА КАРТЫ =====
  img.addEventListener('load', function() {
    loader.style.display = 'none';
    centerMap();
  });

  window.addEventListener('resize', centerMap);

  if (img.complete) {
    loader.style.display = 'none';
    centerMap();
  }

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

  // ===== ЗАКРЫТИЕ ИНФО-ПАНЕЛИ =====
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
