export default {
  id: 3,
  title: 'Страх стада',
  description: 'Животные группы в ужасе останавливаются. Длань Батрины должна совершить проверку навыка Уход за Животными.',
  checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Блок с пояснением (без генерации)
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px;">🐾 Животные чувствуют опасность. Бросьте по таблице Опасные существа зоны (см. в документе края)</div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Длань Батрины успокаивает животных. Группа получает +1 к Прибытию и преимущество на проверки навыка Внимательность для Глаза Звезд в фазе Путь.',
        'success': 'Животные успокаиваются, а группа получает +1 к Прибытию.',
        'fail': 'Животные сильно обеспокоены и с трудом идут дальше. Группа получает -1 к Прибытию.',
        'fail_5': 'Звери намертво застыли от страха. То, что они чувствовали, набрасывается на группу. Группа получает -2 к Прибытию.'
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
    } else if (value >= difficulty - 4) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { arrival: -2 };
    }
    
    return { resultType, resultText, effects };
  }
};
