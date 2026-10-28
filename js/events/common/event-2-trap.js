export default {
  id: 2,
  title: 'Ловушка',
  description: 'Что-то здесь не так. Вся группа должна совершить бросок роли, выбирая наименьший показатель из своих навыков.',
  checkInfo: 'Вся группа совершает бросок роли, выбирая наименьший показатель из своих навыков.',
  type: 'trap',
  
  tables: {
    'traps': { label: 'Таблица Ловушек', fields: ['name', 'description'] },
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description', 'effects', 'attunement'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('traps', event.id, 'main_traps', event);
    html += createMultipleBars(event, 'main', 'Результаты проверки (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'all_success': 'Группа может либо разрядить ловушку, либо напасть (если это ловушка-встреча) на неё с раундом сюрпризом, либо обойти её тихо.',
        'half_success': 'Группа замечает ловушку.',
        'half_fail': 'Ловушка срабатывает.',
        'all_fail': 'Ловушка срабатывает. Если ловушка не является похищением, вся группа умирает.',
        'crit_success': 'Группа не только разряжает ловушку, но и находит ценный ресурс.',
        'crit_fail': 'Ловушка срабатывает со всей силой. Проверка Искры для всех.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'crit_success') {
        html += '<div style="margin-top: 6px; font-size: 14px; color: #ffd700;">Найден ценный артефакт:</div>';
        html += createTableButton('artefacts', event.id, 'artefact_trap_crit', event);
      }
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
    
    // ============================================================
    // ВАЖНО: сначала проверяем крайние случаи (все успели / все провалили)
    // ============================================================
    if (successes === total) {
      const hasCritSuccess = values.some(v => v >= difficulty + 5);
      if (hasCritSuccess) {
        resultType = 'crit_success';
        resultText = 'Критический успех!';
      } else {
        resultType = 'all_success';
        resultText = 'Все преуспели!';
      }
    } else if (failures === total) {
      const hasCritFail = values.some(v => v <= difficulty - 5);
      if (hasCritFail) {
        resultType = 'crit_fail';
        resultText = 'Критический провал!';
      } else {
        resultType = 'all_fail';
        resultText = 'Все провалили!';
      }
    } else if (successes >= half) {
      resultType = 'half_success';
      resultText = 'Больше половины преуспели!';
    } else {
      resultType = 'half_fail';
      resultText = 'Больше половины провалили!';
    }
    
    return { resultType, resultText };
  }
};
