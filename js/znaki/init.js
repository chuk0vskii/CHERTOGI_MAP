// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

import { loadRegions, initRegionChangeHandler } from '../modules/region.js';
import { drawSign, resetSigns } from '../modules/signs.js';
import { generatePathEvents, initPath } from '../modules/path.js';

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
    // Удаляем старый обработчик, чтобы избежать дублирования
    drawBtn.removeEventListener('click', drawSign);
    drawBtn.addEventListener('click', drawSign);
    console.log('✅ Кнопка "Узнать знак" настроена');
  }
  
  if (resetBtn) {
    resetBtn.removeEventListener('click', resetSigns);
    resetBtn.addEventListener('click', resetSigns);
    console.log('✅ Кнопка "Сбросить эффекты" настроена');
  }
  
  if (generateBtn) {
    generateBtn.removeEventListener('click', generatePathEvents);
    generateBtn.addEventListener('click', generatePathEvents);
    console.log('✅ Кнопка "Сгенерировать события" настроена');
  }
  
  if (signInput) {
    signInput.removeEventListener('keydown', handleSignInputKeydown);
    signInput.addEventListener('keydown', handleSignInputKeydown);
  }
  
  // Инициализируем path (навешиваем обработчики)
  try {
    initPath();
    console.log('✅ Path инициализирован');
  } catch (e) {
    console.error('❌ Ошибка инициализации path:', e);
  }
  
  console.log('✅ Инициализация завершена');
});

// Отдельная функция для обработки Enter в поле ввода знака
function handleSignInputKeydown(e) {
  if (e.key === 'Enter') {
    const drawBtn = document.getElementById('drawSignBtn');
    if (drawBtn) drawBtn.click();
  }
}
