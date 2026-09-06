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
        'all_success': 'Группа может либо разрядить ловушку,
