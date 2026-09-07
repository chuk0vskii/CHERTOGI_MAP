export default {
  id: 3,
  title: 'Древние Руины',
  description: 'Группа набредает на древнее строение.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'ruins',
  
  tables: {
    'ruins': { label: 'Таблица Руин', fields: ['name', 'pass_method', 'reward_type'] },
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description'] }
  },
  
  hasSecondCheck: true,
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('ruins', event.id, 'main_ruins', event);
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'all_or_half_success': 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 к Прибытию.',
        'half_fail': 'Что разрушило строение? Что это за знаки? Что их ждёт дальше? Мораль группы начинает разваливаться, они получают -1 к Прибытию.',
        'all_fail': 'Что за кошмары могут обитать в этой местности? Группа начинает в удвоенном темпе сбегать с места. Если же группа решит исследовать руины, ее члены будут считаться Испуганными любыми существами находящимися рядом на все время исследования.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'all_or_half_success' || resultType === 'crit_success') {
        addArrivalBonus(1);
      }
      if (resultType === 'half_fail') {
        addArrivalBonus(-1);
      }
    }
    
    html += '<div class="second-check-section">';
    html += createSingleBar(event, 'second', 'Проверка Ловкости рук (Тень Нарара) (сложность ' + difficulty + ')', difficulty);
    
    if (event.secondChecked) {
      const secondResult = event.secondResult;
      html += createResult(secondResult, event.secondResultText);
      
      const secondEffects = {
        'success_5': 'Тень Нарара находит 2 ценных артефакта.',
        'success': 'Тень Нарара находит магический предмет.',
        'fail': 'Группа задерживается и ей приходится совершать отдых у руин, получая эффект проверки Искры повторно.',
        'fail_5': 'Тень Нарара задерживается среди руин, а группа привлекает внимание жителей местности.'
      };
      html += createEffect(secondResult, secondEffects);
      
      if (secondResult === 'success_5') {
        html += '<div style="margin-top: 6px; font-size: 14px; color: #ffd700;">Найдено 2 ценных артефакта:</div>';
        html += createTableButton('artefacts', event.id, 'artefact_second_crit_1', event);
        html += createTableButton('artefacts', event.id, 'artefact_second_crit_2', event, 2);
      }
      
      if (secondResult === 'success') {
        html += '<div style="margin-top: 6px; font-size: 14px; color: #51cf66;">Найден магический предмет:</div>';
        html += createTableButton('artefacts', event.id, 'artefact_second_success', event);
      }
    }
    html += '</div>';
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const isSecond = type === 'second';
    
    if (isSecond) {
      const value = values[0] || 0;
      let resultType = '';
      let resultText = '';
      
      if (value >= difficulty + 5) {
        resultType = 'success_5';
        resultText = 'Критический успех! (2 артефакта)';
      } else if (value >= difficulty) {
        resultType = 'success';
        resultText = 'Успех! (1 артефакт)';
      } else if (value >= difficulty - 5) {
        resultType = 'fail';
        resultText = 'Провал...';
      } else {
        resultType = 'fail_5';
        resultText = 'Критический провал!';
      }
      
      return { resultType, resultText };
    }
    
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes >= half) {
      const hasCrit = values.some(v => v >= difficulty + 5);
      if (hasCrit && successes === total) {
        resultType = 'crit_success';
        resultText = 'Критический успех!';
      } else {
        resultType = 'all_or_half_success';
        resultText = 'Успех!';
      }
    } else if (failures >= half) {
      const hasCritFail = values.some(v => v <= difficulty - 5);
      if (hasCritFail && failures === total) {
        resultType = 'crit_fail';
        resultText = 'Критический провал!';
      } else {
        resultType = 'half_fail';
        resultText = 'Провал...';
      }
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    return { resultType, resultText };
  }
};
