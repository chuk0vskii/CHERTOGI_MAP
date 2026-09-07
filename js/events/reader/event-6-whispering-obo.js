export default {
  id: 6,
  title: 'Шепчущий обо',
  description: 'Группа останавливается у древнего обо, на котором вырезаны знаки или развиваются узлы с посланием.',
  checkInfo: 'Чтец Знаков совершает проверку Традиций, чтобы понять, кому принадлежит обо и что это может раскрыть в пути.',
  type: 'whispering_obo',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиций (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Знаки предвещают важную истину. +1 к Прибытию и 1 кость удачи.',
        'success': 'Группа получает +1 к Прибытию.',
        'fail': 'Чтение сбивает Чтеца с толку — он теряет -1 к Искре.',
        'fail_5': 'Группа принимает знак за проклятие. Проверка Искры, и +1 событие в фазе Путь.'
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
      effects = { arrival: 1 };
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { events: 1 }; // ТОЛЬКО 1 событие
    }
    
    return { resultType, resultText, effects };
  }
};
