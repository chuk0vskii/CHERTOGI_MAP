export default {
  id: 6,
  title: 'Шепчущий обо',
  description: 'Группа останавливается у древнего обо, на котором вырезаны знаки или развиваются узлы с посланием.',
  checkInfo: 'Чтец Знаков совершает проверку Традиций, чтобы понять, кому принадлежит обо и что это может раскрыть в пути.',
  type: 'whispering_obo',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиций', 12);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Знаки предвещают важную истину. +1 к Прибытию и 1 кость удачи.',
        'success': 'Группа получает +1 к Прибытию.',
        'fail': 'Чтение сбивает Чтеца с толку — он теряет -1 к Искре.',
        'fail_5': 'Группа принимает знак за проклятие. Проверка Искры, и +1 событие в фазе Путь.'
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
