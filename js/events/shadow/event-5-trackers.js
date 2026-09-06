export default {
  id: 5,
  title: 'Следопыты',
  description: 'Тень замечает следы другого отряда или неизвестных существ.',
  checkInfo: 'Тень совершает проверку Скрытности или Ловкости рук (на выбор).',
  type: 'trackers',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-top: 8px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px;">Выберите навык:</label>';
    html += '<select id="skill-select-' + event.id + '" style="width:100%; padding:8px 12px; margin-top:4px; background:rgba(255,255,255,0.05); border:1px solid #4a0e0e; border-radius:6px; color:#ffffff; font-family:\'Philosopher\', sans-serif;">';
    html += '<option value="скрытность">Скрытность</option>';
    html += '<option value="ловкость">Ловкость рук</option>';
    html += '</select>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Результат проверки (сложность ' + difficulty + ')', difficulty);
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Тень прослеживает путь этих существ и избегает контакта — группа получает +1 к Прибытию.',
        'fail': 'Незнакомцы замечают группу.',
        'fail_5': 'Группа заходит в засаду. Начинается бой с раундом сюрприза.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        if (typeof addArrivalBonus === 'function') addArrivalBonus(1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
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
