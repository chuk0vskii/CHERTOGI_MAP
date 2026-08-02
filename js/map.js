(function() {
  const img = document.getElementById('mapImage');
  const wrapper = document.getElementById('mapWrapper');
  const markersContainer = document.getElementById('markersContainer');

  const infoPanel = document.getElementById('infoPanel');
  const infoTitle = document.getElementById('infoTitle');
  const infoDescription = document.getElementById('infoDescription');
  const infoClose = document.getElementById('infoClose');
  const overlay = document.getElementById('overlay');

  const IMG_W = 5100;
  const IMG_H = 2500;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let minScale = 1;
  const MAX_SCALE = 2.0;

  function update() {
    const transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.transform = transform;
    if (markersContainer) markersContainer.style.transform = transform;
  }

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

  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    let newScale = scale + delta;
    newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

    if (newScale === scale) return;

    const px = (mouseX - tx) / (IMG_W * scale);
    const py = (mouseY - ty) / (IMG_H * scale);

    const newW = IMG_W * newScale;
    const newH = IMG_H * newScale;

    tx = mouseX - px * newW;
    ty = mouseY - py * newH;

    const maxX = rect.width - newW;
    const maxY = rect.height - newH;
    tx = Math.min(Math.max(tx, maxX), 0);
    ty = Math.min(Math.max(ty, maxY), 0);

    scale = newScale;
    update();
  }, { passive: false });

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

  function closeInfo() {
    infoPanel.classList.remove('open');
    overlay.classList.remove('active');
  }

  if (infoClose) infoClose.addEventListener('click', closeInfo);
  if (overlay) overlay.addEventListener('click', closeInfo);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInfo();
  });

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
