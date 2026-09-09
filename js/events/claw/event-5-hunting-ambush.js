export default {
  id: 5,
  title: 'Засада на охоте',
  description: 'Во время охоты Коготь попадает в засаду. Проверка Выживания у Когтя Акрепы, если с ним пошёл Тень Нарара, он может совершить проверку Скрытности чтобы увести их обоих от опасности.',
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
        'success_5': 'Коготь Акрепы ускользает и даже находит ресурсы. +1 к уровню Провизии.',
        'success': 'Коготь Акрепы сбегает, но добычу приходится оставить.',
        'fail': 'Коготь Акрепы сбегает, но приводит опасность к группе. Сделайте бросок по таблице Смертельные существа зоны (см. в документе края).',
        'fail_5': 'Битва неизбежна и враг ходит первый. Сделайте бросок по таблице Смертельные существа зоны (см. в документе края).'
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
      effects = null;
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
