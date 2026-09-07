export default {
  id: 4,
  title: 'Бескрайние Пейзажи',
  description: 'Группа проходит невероятные бескрайние пейзажи, они одновременно и величественные, и вдохновляющие, и устрашающие. Глядя на эти пейзажи, группа чувствует себя незначительной песчинкой в этих землях.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'landscapes',
  
  render: function(event, helpers) {
    const { createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'all_or_half_success': 'Путники чувствуют вдохновение от пейзажей и получают +1 к Прибытию и 1 Кость Удачи.',
        'half_fail': 'Группа чувствует что она сможет покорить этот край, но потери неизбежны, они получают -1 к Прибытию.',
        'all_fail': 'Этот пейзаж угнетает, они получают -1 к Прибытию.'
      };
      html += createEffect(resultType, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
      effects = { arrival: 1 };
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
      effects = { arrival: -1 };
    }
    
    return { resultType, resultText, effects };
  }
};
