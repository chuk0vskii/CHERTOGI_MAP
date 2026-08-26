// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions, initRegionChangeHandler } from '../modules/region.js';
import { drawSign, resetSigns } from '../modules/signs.js';
import { generatePathEvents } from '../modules/path.js';

console.log('🚀 znaki/init.js загружен');

document.addEventListener('DOMContentLoaded', async function() {
  console.log('📦 DOM загружен');
  
  // Загружаем регионы
  try {
    await loadRegions();
    console.log('✅ Регионы загружены');
  } catch (e) {
    console.error('❌ Ошибка загрузки регионов:', e);
  }
  
  // Инициализируем обработчик смены региона
  try {
    initRegionChangeHandler();
    console.log('✅ Обработчик региона инициализирован');
  } catch (e) {
    console.error('❌ Ошибка инициализации обработчика:', e);
  }
  
  // Навешиваем обработчики на кнопки
  const drawBtn = document.getElementById('drawSignBtn');
  const resetBtn = document.getElementById('resetSignsBtn');
  const generateBtn = document.getElementById('generateEventsBtn');
  const signInput = document.getElementById('signInput');
  
  if (drawBtn) {
    drawBtn.addEventListener('click', drawSign);
    console.log('✅ Кнопка "Узнать знак" настроена');
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSigns);
    console.log('✅ Кнопка "Сбросить эффекты" настроена');
  }
  
  if (generateBtn) {
    generateBtn.addEventListener('click', generatePathEvents);
    console.log('✅ Кнопка "Сгенерировать события" настроена');
  }
  
  if (signInput) {
    signInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') drawSign();
    });
  }
  
  // Обработчик смены региона (дополнительный)
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
