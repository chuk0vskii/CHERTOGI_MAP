export default {
  id: 4,
  title: 'Это должно было произойти!',
  description: 'Нити судьбы были связаны еще перед началом пути. Хранитель узлов выбирает одно событие из списка и оно происходит в любой момент по его выбору.',
  checkInfo: 'Чтец Знаков делает проверку Традиций.',
  type: 'fate',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty, getCommonEventsList } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Выпадающий список всех общих событий
    html += '<div style="margin-top: 8px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px;">Выберите событие:</label>';
    html += '<select id="fate-select-' + event.id + '" style="width:100%; padding:8px 12px; margin-top:4px; background:rgba(255,255,255,0.05); border:1px solid #4a0e0e; border-radius:6px; color:#ffffff; font-family:\'Philosopher\', sans-serif;">';
    html += '<option value="1">Знаменье Темной Нити</option>';
    html += '<option value="2">Ловушка</option>';
    html += '<option value="3">Древние Руины</option>';
    html += '<option value="4">Бескрайние Пейзажи</option>';
    html += '<option value="5">Невероятный Оазис</option>';
    html += '<option value="6">Вмешательство звезд</option>';
    html += '</select>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Традиций (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Чтец знаков узнает о событии и может подготовить группу к нему. Выбранное событие отображается с пометкой "Известно заранее".',
        'success': 'Чтец знаков узнает о том, что будет еще какое-то событие, но не знает какое именно. Отображается сообщение о неизвестном будущем событии.',
        'fail': 'Чтец знаков путается в чтении и совершает повторный бросок по таблице из фазы Чтение знаков.',
        'fail_5': 'Чтец знаков невольно нарушает нити судьбы, что приводит к еще одному событию в фазе Путь на выбор Хранителя узлов. Добавьте событие из списка.'
      };
      html += createEffect(event.result, effects);
      
      // Если выбран success_5, показываем выбранное событие
      if (event.result === 'success_5' && event.selectedEvent) {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
        html += '📌 Известно заранее: <strong>' + event.selectedEvent.title + '</strong>';
        html += '</div>';
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
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
};
