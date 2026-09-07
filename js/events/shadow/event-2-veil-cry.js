export default {
  id: 2,
  title: 'Плачь Вуали',
  description: 'Движение вуали в регионе привлекает существ вуали. Тень Нарара обнаруживает их, как будто эти существа появились из воздуха.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'veil_cry',
  
  tables: {
    'veil_children': { label: 'Таблица Дети Вуали', fields: ['name', 'description'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('veil_children', event.id, 'main_veil_children', event);
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Тень может ускользнуть от них и провести группу безопасно.',
        'fail': 'Тень успевает вернуться к группе перед тем, как начнется сражение.',
        'fail_5': 'Тень Нарара на 1 раунд оказывается один на один с этими существами.'
      };
      html += createEffect(event.result, effects);
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
