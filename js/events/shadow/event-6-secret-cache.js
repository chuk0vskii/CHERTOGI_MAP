export default {
  id: 6,
  title: 'Потайной тайник',
  description: 'Тень замечает остатки укрытого схрона — возможно, брошенного искателями или погибшими кочевниками.',
  checkInfo: 'Тень совершает проверку Ловкости рук.',
  type: 'secret_cache',
  
  tables: {
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description'] },
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Ловкости рук (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'В тайнике обнаружено ценное. Группа также получает +1 к Искре.',
        'success': 'Найдены редкие ресурсы — куб провизии восстанавливается на 1 уровень, и группа получает +1 к Прибытию.',
        'fail': 'Тень случайно заставляет сработать ловушку, тень Нарара получает 5к6 урона с любым типом на усмотрение Хранителя узлов.',
        'fail_5': 'Тайник оказался приманкой. Срабатывает событие «Опасная встреча».'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'success') {
        addArrivalBonus(1);
      }
      
      if (resultType === 'success_5' || resultType === 'success') {
        html += createTableButton('artefacts', event.id, 'extra_artefacts', event);
        if (resultType === 'success_5') {
          html += createTableButton('artefacts', event.id, 'extra_artefacts_2', event, 2);
        }
      }
      
      if (resultType === 'fail_5') {
        html += createTableButton('zone_conflicts', event.id, 'extra_zone_conflicts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_
