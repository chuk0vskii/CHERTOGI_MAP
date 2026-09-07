export default {
  id: 1,
  title: 'Духи пожирание',
  description: 'Провизия кончается быстро. Проклятие ли это злых духов, или просто неудача, но её почти нет. Коготь Акрепы должен совершить проверку навыка Выживание, чтобы вновь пополнить запасы. Если группа игнорирует проблему, их провизия кончается.',
  checkInfo: 'Коготь Акрепы совершает проверку Выживания.',
  type: 'claw',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Зоны', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Выживания (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Провизия расходуется обычно, вопреки чудовищному голоду.',
        'fail': 'Группа теряет 2 уровня провизии.',
        'fail_5': 'Группа теряет 2 уровня провизии, Коготь Акрепы делает Проверку Кремня от усталости.'
      };
      html += createEffect(resultType, effects);
      
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
    let effects = null;
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
      effects = null;
    } else if (value >= difficulty - 4) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
