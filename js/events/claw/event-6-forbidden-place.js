export default {
  id: 6,
  title: 'Запретное место',
  description: 'Коготь следует за добычей и приходит к странному месту. Хранитель узлов выбирает тип места, затем Коготь Акрепы совершает проверку Выживания.',
  checkInfo: 'Выберите тип места и совершите проверку Выживания.',
  type: 'claw',
  
  tables: {
    'reality_tears': { label: 'Проломы Реальности', fields: ['name', 'description', 'effect'] },
    'oasis_mysteries': { label: 'Загадки Оазисов', fields: ['oasis_type', 'mystery'] },
    'ruins': { label: 'Древние Руины', fields: ['name', 'pass_method', 'reward_type'] },
    'slaughter_zones': { label: 'Бойня Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Выпадающий список для выбора типа места
    html += '<div style="margin-top: 8px; margin-bottom: 12px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px; display: block; margin-bottom: 4px;">Выберите тип места:</label>';
    html += '<select id="place-select-' + event.id + '" style="width:100%; padding:12px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#e0d5c0; font-size:16px; font-family:\'Philosopher\', sans-serif; cursor:pointer; transition:border-color 0.3s; appearance:none; -webkit-appearance:none; background-image:url(\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23ffd700\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E\'); background-repeat:no-repeat; background-position:right 16px center;">';
    html += '<option value="reality_tears" style="background:#1a0a1a; color:#e0d5c0;">Пролом Реальности</option>';
    html += '<option value="oasis_mysteries" style="background:#1a0a1a; color:#e0d5c0;">Невероятный Оазис</option>';
    html += '<option value="ruins" style="background:#1a0a1a; color:#e0d5c0;">Древние Руины</option>';
    html += '<option value="slaughter_zones" style="background:#1a0a1a; color:#e0d5c0;">Бойня Области</option>';
    html += '</select>';
    html += '</div>';
    
    // Кнопка для генерации по выбранной таблице
    html += '<div style="margin-bottom: 12px;">';
    html += '<button class="btn-place-generate" data-event-id="' + event.id + '" style="background:transparent; border:1px solid rgba(255,215,0,0.3); color:#ffd700; padding:6px 18px; border-radius:6px; cursor:pointer; font-family:\'Philosopher\', sans-serif; font-size:13px; transition:all 0.3s ease;" onmouseover="this.style.background=\'rgba(255,215,0,0.1)\'; this.style.borderColor=\'#ffd700\'" onmouseout="this.style.background=\'transparent\'; this.style.borderColor=\'rgba(255,215,0,0.3)\'">Сгенерировать место</button>';
    html += '<div id="place-result-' + event.id + '" style="margin-top: 6px;"></div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Выживания (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Добыча не замечает его. +1 к уровню Провизии.',
        'fail': 'Добыча теряется из вида.'
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
      effects = null;
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
