export default {
  id: 3,
  title: 'Испытание на Горизонте',
  description: 'Группа проходит около событий конфликта местности. Глаз Звезд должен совершить проверку навыка Внимательности, чтобы заметить происходящее раньше, чем участники конфликта заметят группу.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  tables: {
    'zone_conflicts': { label: 'Конфликт Зоны', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Генерация по таблице zone_conflicts
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">⚔️ Что происходит на горизонте:</div>';
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    html += '</div>';
    
    // Проверка Внимательности
    html += createSingleBar(event, 'main', 'Проверка Внимательности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Глаз Звезд может предупредить группу о том, что он заметил, и они остаются скрытыми ещё на дистанции.',
        'fail': 'Группу замечают.'
      };
      html += createEffect(resultType, effects);
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
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
