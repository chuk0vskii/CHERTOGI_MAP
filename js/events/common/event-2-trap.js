export default {
  id: 2,
  title: 'Ловушка',
  description: 'Что-то здесь не так. Вся группа должна совершить бросок роли, выбирая наименьший показатель из своих навыков.',
  checkInfo: 'Вся группа совершает бросок роли, выбирая наименьший показатель из своих навыков.',
  type: 'trap',
  
  tables: {
    'traps': { label: 'Таблица Ловушек', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('traps', event.id, 'main_traps', event);
    html += createMultipleBars(event, 'main', 'Результаты проверки (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_success': 'Группа может либо разрядить ловушку, либо напасть (если это ловушка-встреча) на неё с раундом сюрпризом, либо обойти её тихо.',
        'half_success': 'Группа замечает ловушку.',
        'half_fail': 'Ловушка срабатывает.',
        'all_fail': 'Ловушка срабатывает. Если ловушка не является похищением, вся группа умирает.',
        'crit_success': 'Группа не только разряжает ловушку, но и находит ценный ресурс.',
        'crit_fail': 'Ловушка срабатывает со всей силой. Проверка Искры для всех.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes === total) {
      resultType = 'all_success';
      resultText = 'Все преуспели!';
    } else if (successes >= half) {
      resultType = 'half_success';
      resultText = 'Больше половины преуспели!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Больше половины провалили!';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    const hasCritSuccess = values.some(v => v >= difficulty + 5);
    const hasCritFail = values.some(v => v <= difficulty - 5);
    
    if (hasCritSuccess && (resultType === 'all_success')) {
      resultType = 'crit_success';
      resultText = 'Критический успех!';
    }
    if (hasCritFail && (resultType === 'all_fail')) {
      resultType = 'crit_fail';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};
