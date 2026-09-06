export default {
  id: 5,
  title: 'Ложные Нити',
  description: 'Иллюзия судьбы в виде удачных путей, поиска провизии и безопасного места ведёт группу в неверном направлении и к опасности.',
  checkInfo: 'Чтец Знаков бросает проверку Расследования.',
  type: 'false_threads',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, createTableButton } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Расследования', 12);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Чтец распознает обман и находит истинный путь. Группа получает +1 к Прибытию.',
        'fail': 'Группа отклоняется от маршрута. +1 событие в фазе Путь.',
        'fail_5': 'Группа оказывается в враждебной зоне.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'fail_5') {
        html += createTableButton('zone_conflicts', event.id, 'extra_zone_conflicts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type) {
    const value = values[0] || 0;
    const difficulty = 12;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};
