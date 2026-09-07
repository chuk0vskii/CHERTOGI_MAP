export default {
  id: 2,
  title: 'Они Пришли за Вами!',
  description: 'Что-то опасное двигается прямо в вашу сторону, слишком поздно бежать. Глаза Звезд должны совершить проверку навыка Внимательность.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  tables: {
    'opasnost_regional': { label: 'Опасные существа региона', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Генерация по региональной таблице (всегда доступна)
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">👹 Кто двигается в вашу сторону:</div>';
    html += createTableButton('opasnost_regional', event.id, 'main_opasnost_regional', event);
    html += '</div>';
    
    // Проверка Внимательности
    html += createSingleBar(event, 'main', 'Проверка Внимательности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Вы замечаете опасность вовремя и можете совершить 1 действие перед столкновением.',
        'fail': 'Бой начинается сразу.',
        'fail_5': 'Группу застали врасплох с раундом сюрприза.'
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
