export default {
  id: 5,
  title: 'Свет среди тьмы',
  description: 'Глаза замечают странное сияние вдали. Проверка Внимательности чтобы определить что это.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  tables: {
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description'] },
    'traps': { label: 'Таблица Ловушек', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addBonusEvent } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Внимательности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Группа находит магический предмет.',
        'fail': 'Это ловушка!'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'success') {
        html += '<div style="margin-top: 6px; font-size: 14px; color: #51cf66;">✨ Найден магический предмет:</div>';
        html += createTableButton('artefacts', event.id, 'extra_artefacts', event);
      }
      
      if (resultType === 'fail') {
        html += '<div style="margin-top: 6px; font-size: 14px; color: #ff6b6b;">⚠️ Это ловушка!</div>';
        html += createTableButton('traps', event.id, 'extra_traps', event);
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
        html += '⭐ Добавлено бонусное событие "Ловушка"';
        html += '</div>';
        if (typeof addBonusEvent === 'function') {
          addBonusEvent(2); // ID события "Ловушка" = 2
        }
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
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
