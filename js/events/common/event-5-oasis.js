export default {
  id: 5,
  title: 'Невероятный Оазис',
  description: 'Группа прибывает в безопасный на вид оазис.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'oasis',
  
  tables: {
    'oasis_mysteries': { label: 'Загадки Оазисов', fields: ['oasis_type', 'mystery'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('oasis_mysteries', event.id, 'main_oasis', event);
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_or_half_success': 'Группа понимает, что это идеальное место для отдыха, где не бушуют ветра и Шамас приглядывает с небес. Группа может сделать длинный отдых и каждый из группы получит одну Кость Удачи. Группа замечает тайну оазиса.',
        'half_fail': 'Группе место кажется безопасным насколько это возможно здесь. Группа может сделать длинный отдых. Но что-то как будто шепчет в этом странном месте, что-то тут не так. Группа замечает тайну оазиса.',
        'all_fail': 'Внешне оазис кажется враждебным и обманчивым. Медленно паранойя начинает подавлять группу. У группы помеха на проверки связанные с Интеллектом до конца фазы Путь.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
      effects = { arrival: 0 };
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
      effects = { arrival: 0 };
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
      effects = { arrival: 0 };
    }
    
    return { resultType, resultText, effects };
  }
};
