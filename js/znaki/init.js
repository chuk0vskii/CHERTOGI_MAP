// ============================================================
// ТОЧКА ВХОДА ДЛЯ СТРАНИЦЫ "В ПУТЬ"
// ============================================================

console.log('🚀 znaki/init.js загружен');

// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📦 DOM загружен');
  
  // Проверяем, что все функции определены
  console.log('🔍 Проверка функций:');
  console.log('  loadRegions:', typeof window.loadRegions);
  console.log('  initRegionChangeHandler:', typeof window.initRegionChangeHandler);
  console.log('  drawSign:', typeof window.drawSign);
  console.log('  resetSigns:', typeof window.resetSigns);
  console.log('  generatePathEvents:', typeof window.generatePathEvents);
  
  // Загружаем регионы
  if (typeof window.loadRegions === 'function') {
    await window.loadRegions();
    console.log('✅ Регионы загружены');
  } else {
    console.error('❌ loadRegions не определена!');
  }
  
  // Инициализируем обработчик смены региона
  if (typeof window.initRegionChangeHandler === 'function') {
    window.initRegionChangeHandler();
  }
  
  // Навешиваем обработчики на кнопки
  const drawBtn = document.getElementById('drawSignBtn');
  const resetBtn = document.getElementById('resetSignsBtn');
  const generateBtn = document.getElementById('generateEventsBtn');
  const signInput = document.getElementById('signInput');
  
  if (drawBtn) {
    drawBtn.addEventListener('click', window.drawSign);
    console.log('✅ Кнопка "Узнать знак" настроена');
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', window.resetSigns);
    console.log('✅ Кнопка "Сбросить эффекты" настроена');
  }
  
  if (generateBtn) {
    generateBtn.addEventListener('click', window.generatePathEvents);
    console.log('✅ Кнопка "Сгенерировать события" настроена');
  }
  
  if (signInput) {
    signInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') window.drawSign();
    });
  }
  
  console.log('✅ Инициализация завершена');
});
