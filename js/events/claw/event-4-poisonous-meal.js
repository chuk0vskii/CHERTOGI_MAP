export default {
  id: 4,
  title: 'Ядовитая трапеза',
  description: 'Охота удачна, но мясо оказывается ядовитым. Проверка Природы у Когтя Акрепы. Длань Батрины может совершить проверку Ухода за Животными чтобы понять причину заражения добычи. Если в группе есть знаток ядов, проверка совершается с преимуществом.',
  checkInfo: 'Коготь Акрепы совершает проверку Природы.',
  type: 'claw',
  
  tables: {
    'parasitic_creatures': { label: 'Таблица Паразитов', fields: ['name', 'description'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Природы (сложность ' + difficulty + ')', difficulty);
    
    html += '<div style="margin-top: 8px;">';
    html += createTableButton('parasitic_creatures', event.id, 'extra_parasitic', event);
    html += '</div>';
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Коготь может использовать заражение в своих целях, получая 1 колбу с ядом, а группа получает +1 к уровню Провизии.',
        'success': 'Коготь замечает отравление до готовки. +1 к уровню Провизии.',
        'fail': 'Вся группа получает состояние Отравленный до конца фазы Путь.',
        'fail_5': 'Заражение проникает во всю еду, провизия заканчивается.'
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
