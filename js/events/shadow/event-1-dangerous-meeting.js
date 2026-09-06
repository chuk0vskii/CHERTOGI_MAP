export default {
  id: 1,
  title: 'Опасная Встреча',
  description: 'Что-то есть на вашем пути.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'dangerous_meeting',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликт Зоны', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа может обойти встречу на безопасной дистанции.',
        'fail': 'Группа замечена.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType
