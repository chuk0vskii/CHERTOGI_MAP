export default {
  id: 2,
  title: 'Нарушенный Баланс',
  description: 'Что-то не так вокруг с животными в окружении искателей, что-то влияет на них. Длань Батрины должна совершить проверку навыка Уход за Животными чтобы узнать что происходит.',
  checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Блок с пояснением о таблице Смертельные существа зоны
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px;">⚖️ Сделайте бросок по таблице Смертельные существа зоны (см. в документе края)</div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Длань узнаёт, что обитает в этих землях, и есть возможность обойти опасность.',
        'fail': 'Длань не может определить, что нарушило баланс в этих землях, и тревожность сказывается на группе. Все в группе делают Проверку Искры от усталости.',
        'fail_5': 'Группа слишком поздно понимает, что за ними охотится то, что обитает в этих землях. Оно нападает на них.'
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
