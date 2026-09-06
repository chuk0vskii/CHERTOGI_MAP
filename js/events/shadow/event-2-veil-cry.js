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
    const { createTableButton, createSingleBar, createResult, createEffect } = helpers;
    let html = '';
    
    html += createTableButton('veil_children', event.id, 'main_veil_children', event);
    html += createSingleBar(event, 'main', 'Проверка Скрытности', 12);
    
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
