// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

console.log('🚀 znaki-init.js загружен');

// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📦 DOM загружен');
  
  // Загружаем регионы
  if (typeof loadRegions === 'function') {
    await loadRegions();
    console.log('✅ Регионы загружены');
  }
  
  // Инициализируем обработчик смены региона
  if (typeof initRegionChangeHandler === 'function') {
    initRegionChangeHandler();
  }
  
  // Навешиваем обработчики на кнопки
  const drawBtn = document.getElementById('drawSignBtn');
  const resetBtn = document.getElementById('resetSignsBtn');
  const generateBtn = document.getElementById('generateEventsBtn');
  const signInput = document.getElementById('signInput');
  
  if (drawBtn) drawBtn.addEventListener('click', drawSign);
  if (resetBtn) resetBtn.addEventListener('click', resetSigns);
  if (generateBtn) generateBtn.addEventListener('click', generatePathEvents);
  
  if (signInput) {
    signInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') drawSign();
    });
  }
  
  // Обработчик смены региона (если не через initRegionChangeHandler)
  const regionSelect = document.getElementById('regionSelect');
  if (regionSelect) {
    regionSelect.addEventListener('change', function() {
      const signResult = document.getElementById('signResult');
      const signPlaceholder = document.getElementById('signPlaceholder');
      if (signResult) signResult.classList.remove('visible');
      if (signPlaceholder) signPlaceholder.style.display = 'block';
      
      const eventsContainer = document.getElementById('eventsContainer');
      if (eventsContainer) {
        eventsContainer.innerHTML = '<div class="no-events">Выберите край и нажмите «Сгенерировать события пути»</div>';
      }
      
      document.getElementById('commonEventsCount').textContent = '—';
      document.getElementById('maxRoleEvents').textContent = '—';
      document.getElementById('roleEventsCount').textContent = '—';
      document.getElementById('totalEventsCount').textContent = '—';
    });
  }
  
  console.log('✅ Инициализация завершена');
});
