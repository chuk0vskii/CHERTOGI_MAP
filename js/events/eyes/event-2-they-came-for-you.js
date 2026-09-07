export default {
  id: 2,
  title: 'Они Пришли за Вами!',
  description: 'Что-то опасное двигается прямо в вашу сторону, слишком поздно бежать. Глаза Звезд должны совершить проверку навыка Внимательность.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
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
      
      if (resultType === 'fail_5') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700;">';
        html += '<div style="color: rgba(255,255,255,0.5); font-size: 12px;">Генерация по таблице опасных существ в зависимости от региона:</div>';
        html += createTableButton('opasnost_regional', event.id, 'extra_opasnost_regional', event);
        html += '</div>';
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
