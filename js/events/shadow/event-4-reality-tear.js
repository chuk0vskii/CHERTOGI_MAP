export default {
  id: 4,
  title: 'Пролом реальности',
  description: 'Группа наблюдает, как реальность изламывается и рвется, словно некая сила пытается проникнуть в мир.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'reality_tear',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-top: 8px;">';
    html += '<button class="btn-reality-tear" data-event-id="' + event.id + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
    html += 'Определить природу пролома';
    html += '</button>';
    html += '<div id="reality-result-' + event.id + '" style="margin-top: 6px; display: none;"></div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа скрытно наблюдает за разломом, не привлекая ненужного внимания.',
        'fail': 'Группа видит приходящих из пролома существ, и они тоже видят группу.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
    }
    
    return { resultType, resultText };
  }
};
