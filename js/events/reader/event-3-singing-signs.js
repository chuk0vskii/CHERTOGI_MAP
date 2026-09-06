export default {
  id: 3,
  title: 'Поющие Знаки',
  description: 'Похоже, что нити судьбы пытаются обречь группу на провал.',
  checkInfo: 'Чтец Знаков совершает проверку Традиции.',
  type: 'singing_signs',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиции', 12);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа избегает все опасности, верно прочитав знаки, и получает +1 на проверку Прибытия и -1 событие в фазе Путь.',
        'fail': 'Добавлено новое общее событие в конце.',
        'fail_5': 'Группа начинает видеть знаки во всем вокруг, получает -1 к уровню Искры. Добавлено новое общее событие в конце.'
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
