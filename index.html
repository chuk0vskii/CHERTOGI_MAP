// ===== ЗУМ ПОД КУРСОРОМ БЕЗ СМЕЩЕНИЯ ВЛЕВО =====
wrapper.addEventListener('wheel', function(e) {
  e.preventDefault();

  const rect = wrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const delta = e.deltaY > 0 ? -STEP : STEP;
  let newScale = scale + delta;
  newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

  if (newScale === scale) return;

  // Точка под курсором в системе координат карты (до зума)
  const px = (mouseX - tx) / scale;
  const py = (mouseY - ty) / scale;

  // Применяем новый масштаб
  scale = newScale;
  fitTiles(scale);

  // Новое смещение, чтобы точка под курсором осталась на месте
  const gridW = tileSize * COLS;
  const gridH = tileSize * ROWS;
  tx = mouseX - px * gridW;
  ty = mouseY - py * gridH;

  // === ОГРАНИЧЕНИЯ ===
  const maxX = rect.width - gridW;
  const maxY = rect.height - gridH;

  // Если карта помещается в экран — центрируем
  if (gridW <= rect.width) {
    tx = (rect.width - gridW) / 2;
  } else {
    tx = Math.min(Math.max(tx, maxX), 0);
  }

  if (gridH <= rect.height) {
    ty = (rect.height - gridH) / 2;
  } else {
    ty = Math.min(Math.max(ty, maxY), 0);
  }

  updateTransform();
}, { passive: false });
