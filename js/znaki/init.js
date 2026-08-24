// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions } from './modules/region.js';
import { drawSign, resetSigns } from './modules/signs.js';
import { generatePathEvents } from './modules/path.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Огненные чертоги — В путь');
  
  await loadRegions();
  
  // Обработчики
  document.getElementById('drawSignBtn')?.addEventListener('click', drawSign);
  document.getElementById('resetSignsBtn')?.addEventListener('click', resetSigns);
  document.getElementById('generateEventsBtn')?.addEventListener('click', generatePathEvents);
  
  document.getElementById('signInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') drawSign();
  });
  
  document.getElementById('regionSelect')?.addEventListener('change', function() {
    document.getElementById('signResult')?.classList.remove('visible');
    document.getElementById('signPlaceholder') ? (document.getElementById('signPlaceholder').style.display = 'block') : null;
    document.getElementById('eventsContainer') ? (document.getElementById('eventsContainer').innerHTML = '<div class="no-events">Выберите край и нажмите «Сгенерировать события пути»</div>') : null;
    document.getElementById('commonEventsCount').textContent = '—';
    document.getElementById('maxRoleEvents').textContent = '—';
    document.getElementById('roleEventsCount').textContent = '—';
    document.getElementById('totalEventsCount').textContent = '—';
  });
  
  console.log('✅ Инициализация завершена');
});
