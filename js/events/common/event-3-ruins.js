export default {
  id: 3,
  title: 'Древние Руины',
  description: 'Группа набредает на древнее строение.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'ruins',
  
  tables: {
    'ruins': { label: 'Таблица Руин', fields: ['name', 'pass_method', 'reward_type'] }
  },
  
  hasSecondCheck: true,
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('ruins', event.id, 'main_ruins', event);
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_or_half_success': 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 к Прибытию.',
        'half_fail': 'Что разрушило строение? Что это за знаки? Что их ждёт дальше? Мораль группы начинает разваливаться, они получают -1 к Прибытию.',
        'all_fail': 'Что за кошмары могут обитать в этой местности? Группа начинает в удвоенном темпе сбегать с места. Если же группа решит исследовать руины, ее члены будут считаться Испуганными любыми существами находящимися рядом на все время исследования.'
      };
      html += createEffect(event.result, effects);
      
      // Эффекты с изменением прибытия
      if (event.result === 'all_or_half_success') {
        // +1 к Прибытию
        if (typeof addArrivalBonus === 'function') addArrivalBonus(1);
      }
      if (event.result === 'half_fail') {
        // -1 к Прибытию
        if (typeof addArrivalBonus === 'function') addArrivalBonus(-1);
      }
    }
    
    // Вторая проверка
    html += '<div class="second-check-section">';
    html += createSingleBar(event, 'second', 'Проверка Ловкости рук (Тень Нарара) (сложность ' + difficulty + ')', difficulty);
    if (event.secondChecked) {
      html += createResult(event.secondResult, event.secondResultText);
      const secondEffects = {
        'success_5': 'Группа находит 2 ценных артефакта.',
        'success': 'Тень Нарара находит магический предмет.',
        'fail': 'Группа задерживается и ей приходится совершать отдых у руин, получая эффект проверки Искры повторно.',
        'fail_5': 'Тень Нарара задерживается среди руин, а группа привлекает внимание жителей местности.'
      };
      html += createEffect(event.secondResult, secondEffects);
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
    
    // Основная проверка
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    return { resultType, resultText };
  }
};
