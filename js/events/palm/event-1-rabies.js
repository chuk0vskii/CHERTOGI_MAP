export default {
  id: 1,
  title: 'Бешенство',
  description: 'С животными что-то не так, будто что-то терзает их разум. Длань Батрины должна совершить проверку навыка Уход за животными.',
  checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
  type: 'palm',
  
  tables: {
    'parasitic_creatures': { label: 'Паразиты Чертогов', fields: ['name', 'description'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Генерация по таблице parasitic_creatures
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">🦠 Что терзает разум животных:</div>';
    html += createTableButton('parasitic_creatures', event.id, 'main_parasitic', event);
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Длань Батрины может успеть спасти животных от бешенства.',
        'fail': 'Животное медленно начинает слабеть и одно из них умирает.',
        'fail_5': 'Животное нападает на группу в ночи. Существо, которое проникло в разум животных, будет продолжать следовать за группой и нападёт при первой хорошей возможности застать путников врасплох.'
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
