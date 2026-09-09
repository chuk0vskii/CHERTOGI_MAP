export default {
  id: 1,
  title: 'Проклятые земли',
  description: 'Группа забрела в темные земли с бушующими в них неизвестными силами. Чтец знаков совершает проверку навыка Традиции для того, чтобы понять, что за темные силы таятся в этих краях.',
  checkInfo: 'Чтец знаков совершает проверку Традиции.',
  type: 'cursed_lands',
  
  tables: {
    'region_curses': { label: 'Таблица Проклятий области', fields: ['name', 'description'] },
    'great_beasts': { label: 'Таблица Великих Зверей', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Кнопка для генерации проклятия области
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">Определите проклятие области:</div>';
    html += createTableButton('region_curses', event.id, 'main_curses', event);
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Традиции (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Чтец замечает следы поверженного зверя, зараженного тьмой, но что-то гораздо больше и сильнее убило его. Видя это поверженное создание тьмы, группа получает преимущество на проверку Искры до конца фазы Путь и +1 к Прибытию.',
        'success': 'Группа получает +1 к Прибытию, обходя темные земли.',
        'fail': 'Группа заходит в темные земли, но успешно замечает это перед тем, как становится слишком поздно, получая -1 к Прибытию.',
        'fail_5': 'Группа получает штраф -1 к Прибытию. Они забрели слишком далеко в логово зла, не заметив этого и пробуждая то, что спит в этих землях.'
      };
      html += createEffect(resultType, effects);
      
      // Если критический успех — таблица great_beasts
      if (resultType === 'success_5') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700;">';
        html += '<div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px;">Следы поверженного зверя:</div>';
        html += createTableButton('great_beasts', event.id, 'extra_great_beasts', event);
        html += '</div>';
      }
      
      // Если критический провал — генерации с броском 1d8
      if (resultType === 'fail_5') {
        html += '<div style="margin-top: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
        html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 8px;">🎲 Бросок 1d8 для определения последствий:</div>';
        html += '<button class="btn-fail-roll" data-event-id="' + event.id + '" style="background:transparent; border:1px solid rgba(255,215,0,0.3); color:#ffd700; padding:6px 18px; border-radius:6px; cursor:pointer; font-family:\'Philosopher\', sans-serif; font-size:13px; transition:all 0.3s ease;" onmouseover="this.style.background=\'rgba(255,215,0,0.1)\'; this.style.borderColor=\'#ffd700\'" onmouseout="this.style.background=\'transparent\'; this.style.borderColor=\'rgba(255,215,0,0.3)\'">🎲 Бросить 1d8</button>';
        html += '<div id="fail-roll-result-' + event.id + '" style="margin-top: 8px;"></div>';
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
      effects = { arrival: 1 };
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
      effects = { arrival: 1 };
    } else if (value >= difficulty - 4) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = { arrival: -1 };
    }
    
    return { resultType, resultText, effects };
  }
};
