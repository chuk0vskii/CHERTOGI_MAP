// ===== ТОЧКА ВХОДА =====
console.log('✅ Карта и маркеры загружены');

// Загружаем маркеры и облака
async function init() {
  await loadMarkers();
  await loadClouds();
}

init();
