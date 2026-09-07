export default {
  id: 5,
  title: 'Следопыты',
  description: 'Тень замечает следы другого отряда или неизвестных существ.',
  checkInfo: 'Тень совершает проверку Скрытности или Ловкости рук (на выбор).',
  type: 'trackers',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Результат проверки (сложность ' + difficulty + ')', difficulty);
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Тень прослеживает путь этих существ и избегает контакта — группа получает +1 к Прибытию.',
        'fail': 'Незнакомцы замечают группу.',
        'fail_5': 'Группа заходит в засаду. Начинается бой с раундом сюрприза.'
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
      effects = { arrival: 1 };
    } else if (value >= difficulty - 5) {
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
