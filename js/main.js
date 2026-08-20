// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

// Загружаем маркеры как оверлеи
if (typeof loadMarkers === 'function') {
  loadMarkers();
} else {
  console.error('❌ Функция loadMarkers не найдена! Проверьте overlays.js');
}
