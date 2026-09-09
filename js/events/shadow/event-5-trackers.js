export default {
  id: 5,
  title: 'Следопыты',
  description: 'Тень замечает следы другого отряда или неизвестных существ. Проверка Скрытности или Ловкости рук (на выбор), чтобы выяснить, кто это.',
  checkInfo: 'Тень совершает проверку Скрытности или Ловкости рук (на выбор).',
  type: 'shadow',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Выпадающий список для выбора навыка
    html += '<div style="margin-top: 8px; margin-bottom: 12px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px; display: block; margin-bottom: 4px;">Выберите навык:</label>';
    html += '<select id="skill-select-' + event.id + '" style="width:100%; padding:12px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#e0d5c0; font-size:16px; font-family:\'Philosopher\', sans-serif; cursor:pointer; transition:border-color 0.3s; appearance:none; -webkit-appearance:none; background-image:url(\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23ffd700\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E\'); background-repeat:no-repeat; background-position:right 16px center;">';
    html += '<option value="скрытность" style="background:#1a0a1a; color:#e0d5c0;">Скрытность</option>';
    html += '<option value="ловкость" style="background:#1a0a1a; color:#e0d5c0;">Ловкость рук</option>';
    html += '</select>';
    html += '</div>';
    
    // Блок с пояснением о таблице Конфликтов Области
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px;">📜 Хранитель узлов кидает по таблице Конфликтов Области (см. в документе края)</div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Результат проверки (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Тень прослеживает путь этих существ и избегает контакта — группа получает +1 к Прибытию.',
        'fail': 'Незнакомцы замечают группу. Сделайте бросок по таблице Смертельные существа зоны (см. в документе края).',
        'fail_5': 'Группа заходит в засаду. Начинается бой с раундом сюрприза. Сделайте бросок по таблице Смертельные существа зоны (см. в документе края).'
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
      effects = { arrival: 1 };
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
