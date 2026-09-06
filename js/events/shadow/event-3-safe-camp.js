export default {
  id: 3,
  title: 'Безопасный Ночлег',
  description: 'Группа в поисках безопасного ночлега.',
  checkInfo: 'Тень Нарара совершает проверку Расследования.',
  type: 'safe_camp',
  
  tables: {
    'opasnost_regional': { label: 'Таблица Опасных Существ Зоны', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Группа находит отличное место для стоянки. +1 к Прибытию и может восстановить 2 уровня Искры или Кремня или по 1 каждый.',
        'success': '+1 уровень Кремня или +1 Искры.',
        'fail': 'Группа не может уснуть из-за постоянного ощущения, что кто-то наблюдает за ними.',
        'fail_5': 'Ваш лагерь расположен прямо в логове монстра.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success_5') {
        if (typeof addArrivalBonus === 'function') addArrivalBonus(1);
      }
      
      if (event.result === 'fail_5') {
        html += createTableButton('opasnost_regional', event.id, 'extra_opasnost', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
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
