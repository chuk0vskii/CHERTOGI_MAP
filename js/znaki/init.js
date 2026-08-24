// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions } from '../modules/region.js';
import { drawSign, resetSigns, initSigns } from '../modules/signs.js';
import { generatePathEvents, initPath } from '../modules/path.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Огненные чертоги — В путь');
  
  // Инициализируем обработчики
  initSigns();
  initPath();
  
  // Загружаем регионы
  await loadRegions();
  
  // Обработчик смены региона
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
