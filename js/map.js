// ===== ЗУМ ПОД КУРСОРОМ (ПРОСТАЯ ПРОПОРЦИЯ) =====
wrapper.addEventListener('wheel', function(e) {
  e.preventDefault();

  const rect = wrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const delta = e.deltaY > 0 ? -STEP : STEP;
  let newScale = scale + delta;
  newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

  if (newScale === scale) return;

  // Точка под мышью в координатах карты (до зума)
  const px = (mouseX - tx) / scale;
  const py = (mouseY - ty) / scale;

  scale = newScale;

  // Смещаем так, чтобы точка под мышью осталась на месте
  tx = mouseX - px * scale;
  ty = mouseY - py * scale;

  applyTransform();
}, { passive: false });
