export default {
  id: 2,
  title: 'Преграда',
  description: 'Что-то мешает группе пройти дальше.',
  checkInfo: 'Чтец Знаков совершает проверку Расследования.',
  type: 'obstacle',
  
  tables: {
    'region_obstacles': { label: 'Таблица Преград Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('region_obstacles', event.id, 'main_obstacles', event);
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Группа успешно обходит преграду и получает +1 к Прибытию.',
        'fail': 'Группа обходит преграду, но с заметными трудностями. Проверка Кремня и -1 к Прибытию.',
        'fail_5': 'Группа должна немедленно начать долгий отдых, поскольку путь будет долгим и нужно подготовиться.'
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
      effects = { arrival: -1 };
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
