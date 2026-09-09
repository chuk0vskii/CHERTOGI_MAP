export default {
  id: 3,
  title: 'Безопасный Ночлег',
  description: 'Группа в поисках безопасного ночлега.',
  checkInfo: 'Тень Нарара совершает проверку Расследования.',
  type: 'safe_camp',
  
  tables: {
    'opasnost_regional': { label: 'Опасные существа зоны', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Группа находит отличное место для стоянки. +1 к Прибытию и может восстановить 2 уровня Искры или Кремня или по 1 каждый.',
        'success': '+1 уровень Кремня или +1 Искры.',
        'fail': 'Группа не может уснуть из-за постоянного ощущения, что кто-то наблюдает за ними.',
        'fail_5': 'Ваш лагерь расположен прямо в логове монстра.'
      };
      html += createEffect(resultType, effects);
      
      // Если критический провал — генерация по региональной таблице
      if (resultType === 'fail_5') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700;">';
        html += '<div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px;">Кто живёт в логове:</div>';
        html += createTableButton('opasnost_regional', event.id, 'extra_opasnost', event);
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
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
      effects = { arrival: 1 };
    } else if (value >= difficulty) {
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
