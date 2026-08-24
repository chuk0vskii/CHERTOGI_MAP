// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions } from '../modules/region.js';
import { drawSign, resetSigns } from '../modules/signs.js';
import { generatePathEvents } from '../modules/path.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Огненные чертоги — В путь');
  
  // Загружаем регионы
  await loadRegions();
  
  // Навешиваем обработчики
  const drawBtn = document.getElementById('drawSignBtn');
  const resetBtn = document.getElementById('resetSignsBtn');
  const generateBtn = document.getElementById('generateEventsBtn');
  const signInput = document.getElementById('signInput');
  const regionSelect = document.getElementById('regionSelect');
  
  if (drawBtn) drawBtn.addEventListener('click', drawSign);
  if (resetBtn) resetBtn.addEventListener('click', resetSigns);
  if (generateBtn) generateBtn.addEventListener('click', generatePathEvents);
  
  if (signInput) {
    signInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') drawSign();
    });
  }
  
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
