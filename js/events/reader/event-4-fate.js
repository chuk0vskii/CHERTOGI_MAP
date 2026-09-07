export default {
  id: 4,
  title: 'Это должно было произойти!',
  description: 'Нити судьбы были связаны еще перед началом пути. Хранитель узлов выбирает одно событие из списка и оно происходит в любой момент по его выбору.',
  checkInfo: 'Чтец Знаков делает проверку Традиций.',
  type: 'fate',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty, getCommonEventsList } = helpers;
    const difficulty = getCurrentDifficulty();
    const commonEvents = getCommonEventsList();
    let html = '';
    
    // Выпадающий список всех общих событий
    html += '<div style="margin-top: 8px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px;">Выберите событие для бонуса:</label>';
    html += '<select id="fate-select-' + event.id + '" style="width:100%; padding:8px 12px; margin-top:4px; background:rgba(255,255,255,0.05); border:1px solid #4a0e0e; border-radius:6px; color:#ffffff; font-family:\'Philosopher\', sans-serif;">';
    html += '<option value="">— Выберите событие —</option>';
    for (var i = 0; i < commonEvents.length; i++) {
      var ev = commonEvents[i];
      var selected = (event.selectedEventId && event.selectedEventId === ev.id) ? 'selected' : '';
      html += '<option value="' + ev.id + '" ' + selected + '>' + ev.title + '</option>';
    }
    html += '</select>';
    html += '<button class="btn-fate-select" data-event-id="' + event.id + '" style="margin-top:6px; background:transparent; border:1px solid rgba(255,215,0,0.3); color:#ffd700; padding:4px 14px; border-radius:6px; cursor:pointer; font-family:\'Philosopher\', sans-serif; font-size:13px;">Добавить бонусное событие</button>';
    html += '</div>';
    
    // Если выбрано бонусное событие — показываем его
    if (event.selectedEventId && event.selectedEventModule) {
      html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.15); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
      html += '⭐ Выбрано бонусное событие: <strong>' + event.selectedEventModule.title + '</strong>';
      html += ' <button class="btn-fate-remove" data-event-id="' + event.id + '" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:16px;">✕</button>';
      html += '</div>';
    }
    
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
      
      // Если выбран success_5, показываем выбранное событие с пометкой "Известно заранее"
      if (event.result === 'success_5' && event.selectedEventId && event.selectedEventModule) {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
        html += '📌 Известно заранее: <strong>' + event.selectedEventModule.title + '</strong>';
        html += '</div>';
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
      effects = null;
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
      effects = null;
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { events: 1 }; // ТОЛЬКО 1 событие
    }
    
    return { resultType, resultText, effects };
  }
};
