export default {
  id: 5,
  title: 'Обострение чувств',
  description: 'Животное ощущает опасность заранее. Проверка Ухода за животными у Длани Батрины. Чтец Знаков совершает проверку Традиций, чтобы понять предзнаменование беды.',
  checkInfo: 'Длань Батрины — Уход за животными, Чтец Знаков — Традиции.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Два бара для проверок
    html += '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';
    html += '<div style="flex: 1; min-width: 200px;">';
    html += createSingleBar(event, 'animal', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    html += '</div>';
    html += '<div style="flex: 1; min-width: 200px;">';
    html += createSingleBar(event, 'traditions', 'Проверка Традиций (сложность ' + difficulty + ')', difficulty);
    html += '</div>';
    html += '</div>';
    
    // Одна кнопка для проверки обоих баров
    html += '<div style="margin-top: 10px;">';
    html += '<button class="btn-check-combined" data-event-id="' + event.id + '" style="background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:6px 20px; border-radius:6px; cursor:pointer; font-size:14px; font-family:\'Philosopher\', sans-serif; transition:all 0.3s ease;" onmouseover="this.style.background=\'#4a0e0e\'" onmouseout="this.style.background=\'rgba(74,14,14,0.6)\'">Проверить оба</button>';
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
