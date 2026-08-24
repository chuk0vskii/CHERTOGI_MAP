// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions, initRegionChangeHandler } from '../modules/region.js';
import { drawSign, resetSigns } from '../modules/signs.js';
import { generatePathEvents } from '../modules/path.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Огненные чертоги — В путь');
  
  // Инициализируем обработчик смены региона
  initRegionChangeHandler();
  
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
  
  // Загружаем регионы
  await loadRegions();
  
  console.log('✅ Инициализация завершена');
});
