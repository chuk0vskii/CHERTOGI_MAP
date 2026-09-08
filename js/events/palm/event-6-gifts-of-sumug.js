export default {
  id: 6,
  title: 'Дары Сумуга',
  description: 'Одно из животных начинает рожать. Проверка Ухода за животными у Длани Батрины.',
  checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Происходит пополнение среди животных, что поднимает дух: +1 к Искре.',
        'fail': 'Животное или дитя умирает или рождается мёртвым, группа делает Проверку Искры от усталости. Чтец Знаков совершает повторный бросок Знаков.'
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
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
