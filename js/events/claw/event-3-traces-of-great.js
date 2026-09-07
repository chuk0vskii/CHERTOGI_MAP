export default {
  id: 3,
  title: 'Следы Великих',
  description: 'В путешествии группа наталкивается на огромные следы. Коготь Акрепы должен совершить проверку навыка Выживание, а Длань Батрины должен совершить проверку навыка Природа, чтобы понять, кем оставлены эти следы.',
  checkInfo: 'Коготь Акрепы — Выживание, Длань Батрины — Природа.',
  type: 'claw',
  
  tables: {
    'great_beasts': { label: 'Таблица Великих Зверей', fields: ['name', 'description', 'treasure'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 6px;">🐾 Определите, кто оставил эти следы:</div>';
    html += createTableButton('great_beasts', event.id, 'main_great_beasts', event);
    html += '</div>';
    
    html += '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';
    html += '<div style="flex: 1; min-width: 200px;">';
    html += createSingleBar(event, 'survival', 'Проверка Выживания (сложность ' + difficulty + ')', difficulty);
    html += '</div>';
    html += '<div style="flex: 1; min-width: 200px;">';
    html += createSingleBar(event, 'nature', 'Проверка Природы (сложность ' + difficulty + ')', difficulty);
    html += '</div>';
    html += '</div>';
    
    // Добавляем кнопку проверки для двух баров
    html += '<div style="margin-top: 10px;">';
    html += '<button class="btn-check-combined" data-event-id="' + event.id + '" style="background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:6px 20px; border-radius:6px; cursor:pointer; font-size:14px; font-family:\'Philosopher\', sans-serif;">Проверить оба</button>';
    html += '</div>';
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'both_success': 'Вы можете выследить зверя и узнать, что это за зверь. Группа получает +1 к уровню Искры при виде величественного создания.',
        'survival_fail': 'Группа видит зверя вдалеке, а Длань Батрины будет знать, что это за зверь.',
        'nature_fail': 'Группа может выследить зверя, но не будет знать, что это за существо.',
        'both_fail': 'Есть шанс 50/50, что группа наткнётся на зверя, но оно будет враждебно к ним.'
      };
      html += createEffect(resultType, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    // Проверяем, что values содержит два значения: [выживание, природа]
    const survivalValue = values[0] || 0;
    const natureValue = values[1] || 0;
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    const survivalSuccess = survivalValue >= difficulty;
    const natureSuccess = natureValue >= difficulty;
    
    if (survivalSuccess && natureSuccess) {
      resultType = 'both_success';
      resultText = 'Обе проверки успешны!';
      effects = null;
    } else if (!survivalSuccess && natureSuccess) {
      resultType = 'survival_fail';
      resultText = 'Выживание провалено, Природа успешна';
      effects = null;
    } else if (survivalSuccess && !natureSuccess) {
      resultType = 'nature_fail';
      resultText = 'Природа провалена, Выживание успешно';
      effects = null;
    } else {
      resultType = 'both_fail';
      resultText = 'Обе проверки провалены';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
