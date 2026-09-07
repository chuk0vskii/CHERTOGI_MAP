export default {
  id: 3,
  title: 'Поющие Знаки',
  description: 'Похоже, что нити судьбы пытаются обречь группу на провал.',
  checkInfo: 'Чтец Знаков совершает проверку Традиции.',
  type: 'singing_signs',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty, addBonusEvent } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиции (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Группа избегает все опасности, верно прочитав знаки, и получает +1 к Прибытию и -1 событие в фазе Путь.',
        'fail': 'Добавлено новое общее событие в конце.',
        'fail_5': 'Группа начинает видеть знаки во всем вокруг, получает -1 к уровню Искры. Добавлено новое общее событие в конце.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'fail' || resultType === 'fail_5') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
        html += '⭐ Добавлено бонусное общее событие в конце списка';
        html += '</div>';
        // НЕ вызываем addBonusEvent здесь, только в handleCheck
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
      effects = { arrival: 1 };
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = { events: 1 }; // ТОЛЬКО 1 событие
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { events: 1 }; // ТОЛЬКО 1 событие
    }
    
    return { resultType, resultText, effects };
  }
};
