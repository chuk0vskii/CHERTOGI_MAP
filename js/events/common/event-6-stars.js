export default {
  id: 6,
  title: 'Вмешательство звезд',
  description: 'Сами боги вмешиваются в судьбу группы, благословляя или показывая свой гнев.',
  checkInfo: 'Все члены группы должны совершить проверку Традиций. Хранитель узлов сравнивает общий результат.',
  type: 'total_check',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Общий результат проверки Традиций', 12);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'total_80': 'Боги благословляют группу и их нити судьбы изгибаются в лучшую сторону. Все негативные эффекты знака из фазы Чтение знаков перестают действовать, а все положительные эффекты удваиваются.',
        'total_60': 'Боги в раздумье и посему судьба группы натягивается как струна. Чтец знаков делает еще один бросок по таблице знаков, у группы +1 событие в фазе Путь.',
        'total_40': 'Боги недовольны малым поклонением и группу настигает их разочарование. Бросьте по таблице Знаков из фазы Чтение знаков с помехой. У группы также -2 в фазе Прибытие.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type) {
    const totalValue = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (totalValue >= 80) {
      resultType = 'total_80';
      resultText = '80 и более — Боги благословляют группу!';
    } else if (totalValue >= 60) {
      resultType = 'total_60';
      resultText = '60 и более — Боги в раздумье!';
    } else {
      resultType = 'total_40';
      resultText = '40 и менее — Боги недовольны!';
    }
    
    return { resultType, resultText };
  }
};
