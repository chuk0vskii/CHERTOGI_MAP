export default {
  id: 1,
  title: 'Проклятые земли',
  description: 'Группа забрела в темные земли с бушующими в них неизвестными силами.',
  checkInfo: 'Чтец знаков совершает проверку Традиции.',
  type: 'cursed_lands',
  
  tables: {
    'region_curses': { label: 'Таблица Проклятий области', fields: ['name', 'description'] },
    'great_beasts': { label: 'Таблица Великих Зверей', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('region_curses', event.id, 'main_curses', event);
    html += createSingleBar(event, 'main', 'Проверка Традиции (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Чтец замечает следы поверженного зверя, зараженного тьмой, но что-то гораздо больше и сильнее убило его. Видя это поверженное создание тьмы, группа получает преимущество на проверку Искры до конца фазы Путь и +1 к Прибытию.',
        'success': 'Группа получает +1 к Прибытию, обходя темные земли.',
        'fail': 'Группа заходит в темные земли, но успешно замечает это перед тем, как становится слишком поздно, получая -1 к Прибытию.',
        'fail_5': 'Группа получает штраф -1 к Прибытию. Они забрели слишком далеко в логово зла, не заметив этого и пробуждая то, что спит в этих землях.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'success_5' || resultType === 'success') {
        addArrivalBonus(1);
      }
      if (resultType === 'fail' || resultType === 'fail_5') {
        addArrivalBonus(-1);
      }
      
      if (resultType === 'success_5') {
        html += createTableButton('great_beasts', event.id, 'extra_great_beasts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
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
