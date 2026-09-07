export default {
  id: 2,
  title: 'Золотая Добыча',
  description: 'Группа натыкается на кучу следов великой добычи. Коготь Акрепы должен совершить проверку навыка Выживание, чтобы отследить её. Если Коготь Акрепы решает не идти за добычей, группа получает -1 к Искре, ведь такая добыча была прямо перед ними, а они её пропустили!',
  checkInfo: 'Коготь Акрепы совершает проверку Выживания.',
  type: 'claw',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Выживания (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Группа пирует и получает +1 уровень Кремня, +1 уровень Искры и +1 к Прибытию.',
        'success': 'Группа получает +1 уровень Кремня и +1 уровень Искры.',
        'fail': 'Группа тратит время в поисках этой добычи, но поиски безуспешны. Группа делает Проверку Кремня от усталости.',
        'fail_5': 'Группа сходит с тропы, делает Проверку Кремня от усталости и получает -1 к Прибытию.'
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
      effects = { arrival: -1 };
    }
    
    return { resultType, resultText, effects };
  }
};
