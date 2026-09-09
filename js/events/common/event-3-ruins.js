export default {
  id: 3,
  title: 'Древние Руины',
  description: 'Группа набредает на древнее строение, киньте по Таблице Руин чтобы определить какого типа. Хранитель Узлов проверьте средние значение Искры группы.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'ruins',
  
  tables: {
    'ruins': { label: 'Таблица Руин', fields: ['name', 'pass_method', 'reward_type'] },
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description'] },
    'opasnost_regional': { label: 'Опасные существа зоны', fields: ['name'], isCreature: true }
  },
  
  hasSecondCheck: true,
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Кнопка для генерации руин из таблицы
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">Определите тип руин:</div>';
    html += createTableButton('ruins', event.id, 'main_ruins', event);
    html += '</div>';
    
    // Проверка Искры
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      // Эффекты для отображения (чисто текст)
      const effects = {
        'all_or_half_success': 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 к Прибытию.',
        'half_fail': 'Что разрушило строение? Что это за знаки? Что их ждёт дальше? Мораль группы начинает разваливаться, они получают -1 к Прибытию.',
        'all_fail': 'Что за кошмары могут обитать в этой местности? Группа начинает в удвоенном темпе сбегать с места. Если же группа решит исследовать руины, ее члены будут считаться Испуганными любыми существами находящимися рядом на все время исследования.'
      };
      html += createEffect(resultType, effects);
    }
    
    // Вторая проверка — Тень Нарара
    html += '<div class="second-check-section" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,215,0,0.15);">';
    html += '<div style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 8px;">🔍 Тень Нарара обыскивает руины:</div>';
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
      
      // Если критический провал — генерация по региональной таблице
      if (secondResult === 'fail_5') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700;">';
        html += '<div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px;">Кто привлёк внимание:</div>';
        html += createTableButton('opasnost_regional', event.id, 'extra_opasnost_regional', event);
        html += '</div>';
      }
    }
    html += '</div>';
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const isSecond = type === 'second';
    
    // ВТОРАЯ ПРОВЕРКА — Тень Нарара
    if (isSecond) {
      const value = values[0] || 0;
      let resultType = '';
      let resultText = '';
      let effects = null;
      
      if (value >= difficulty + 5) {
        resultType = 'success_5';
        resultText = 'Критический успех! (2 артефакта)';
        effects = null;
      } else if (value >= difficulty) {
        resultType = 'success';
        resultText = 'Успех! (1 артефакт)';
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
    
    // ОСНОВНАЯ ПРОВЕРКА — Проверка Искры
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    // Логика проверки:
    // 1. Если все или больше половины преуспели → +1 прибытие
    // 2. Если больше половины провалили → -1 прибытие
    // 3. Если все провалили → -1 прибытие (но другое сообщение)
    
    if (successes >= half) {
      // Все или больше половины преуспели
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
      effects = { arrival: 1 };
      
    } else if (failures > half) {
      // Больше половины провалили
      resultType = 'half_fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
      
    } else if (failures === total) {
      // Все провалили
      resultType = 'all_fail';
      resultText = 'Все провалили!';
      effects = { arrival: -1 };
      
    } else {
      // Если successes < half, но failures <= half (редкий случай с чётным количеством и равным разделением)
      // По умолчанию считаем как провал
      resultType = 'half_fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    }
    
    return { resultType, resultText, effects };
  }
};
