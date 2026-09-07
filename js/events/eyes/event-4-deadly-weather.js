export default {
  id: 4,
  title: 'Смертельная погода',
  description: 'Что-то назревает на горизонте. Глаз Звезд должен совершить проверку навыка Внимательность, чтобы заметить вовремя изменение в погоде.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  tables: {
    'storm_eyes': { label: 'Око Штормов', fields: ['name', 'description', 'effects'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Внимательности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Группа не теряет надежды и получает +1 к уровню Искры и +1 к Прибытию.',
        'success': 'Группа избегает плохой погоды и получает +1 к Прибытию.',
        'fail': 'Группа получает -1 к Прибытию, делается Проверка Кремня от усталости. Группа попадает в смертельную погоду.',
        'fail_5': 'Группа получает -2 к Прибытию, Проверка Кремня и Проверка Искры от усталости. Искатели забредают прямо в око шторма.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'fail_5') {
        html += createTableButton('storm_eyes', event.id, 'extra_storm_eyes', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
      effects = { arrival: 1 };
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
      effects = { arrival: 1 };
    } else if (value >= difficulty - 4) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { arrival: -2 };
    }
    
    return { resultType, resultText, effects };
  }
};
