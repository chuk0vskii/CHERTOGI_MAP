export default {
  id: 5,
  title: 'Обострение чувств',
  description: 'Животное ощущает опасность заранее. Проверка Ухода за животными у Длани Батрины. Чтец Знаков совершает проверку Традиций, чтобы понять предзнаменование беды.',
  checkInfo: 'Длань Батрины — Уход за животными, Чтец Знаков — Традиции.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Два бара для проверок (без кнопок)
    html += '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';
    
    // Бар 1: Уход за животными
    html += '<div style="flex: 1; min-width: 200px;">';
    html += '<div class="event-check-row">';
    html += '<label for="check-' + event.id + '-animal" style="color: rgba(255,255,255,0.5); font-size: 13px; display: block; margin-bottom: 4px;">Проверка Ухода за животными (сложность ' + difficulty + ')</label>';
    html += '<input type="number" id="check-' + event.id + '-animal" min="1" max="30" value="10" class="check-input" data-event-id="' + event.id + '" data-type="animal" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#ffffff; font-size:18px; text-align:center; font-family:\'Philosopher\', sans-serif; box-sizing:border-box;">';
    html += '</div>';
    html += '</div>';
    
    // Бар 2: Традиции
    html += '<div style="flex: 1; min-width: 200px;">';
    html += '<div class="event-check-row">';
    html += '<label for="check-' + event.id + '-traditions" style="color: rgba(255,255,255,0.5); font-size: 13px; display: block; margin-bottom: 4px;">Проверка Традиций (сложность ' + difficulty + ')</label>';
    html += '<input type="number" id="check-' + event.id + '-traditions" min="1" max="30" value="10" class="check-input" data-event-id="' + event.id + '" data-type="traditions" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#ffffff; font-size:18px; text-align:center; font-family:\'Philosopher\', sans-serif; box-sizing:border-box;">';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    
    // ОДНА кнопка для проверки обоих баров
    html += '<div style="margin-top: 12px;">';
    html += '<button class="btn-check-combined" data-event-id="' + event.id + '" style="background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:8px 28px; border-radius:6px; cursor:pointer; font-size:14px; font-family:\'Philosopher\', sans-serif; transition:all 0.3s ease;" onmouseover="this.style.background=\'#4a0e0e\'" onmouseout="this.style.background=\'rgba(74,14,14,0.6)\'">Проверить</button>';
    html += '</div>';
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'reader_success': 'Чтец знаков узнаёт одно из событий на выбор Хранителя Узлов, которое случится в будущем. Если это последнее событие, группа получает +1 к Прибытию.',
        'palm_success': 'Животное будет готово предупредить группу вовремя. Преимущество к проверкам Внимательности Глаз Звезд на следующие 2 события.',
        'both_fail': 'Группа отвлекается на поведение животного: +1 событие фазы Путь, -1 к Прибытию.'
      };
      html += createEffect(resultType, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    // values: [уход_за_животными, традиции]
    const animalValue = values[0] || 0;
    const traditionsValue = values[1] || 0;
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    const animalSuccess = animalValue >= difficulty;
    const traditionsSuccess = traditionsValue >= difficulty;
    
    if (traditionsSuccess && !animalSuccess) {
      resultType = 'reader_success';
      resultText = 'Чтец Знаков успешен!';
      effects = null;
    } else if (!traditionsSuccess && animalSuccess) {
      resultType = 'palm_success';
      resultText = 'Длань Батрины успешна!';
      effects = null;
    } else if (traditionsSuccess && animalSuccess) {
      // Если оба успешны — выбираем более важный (Чтец Знаков)
      resultType = 'reader_success';
      resultText = 'Обе проверки успешны! (Чтец Знаков)';
      effects = null;
    } else {
      resultType = 'both_fail';
      resultText = 'Обе проверки провалены';
      effects = { arrival: -1, events: 1 };
    }
    
    return { resultType, resultText, effects };
  }
};
