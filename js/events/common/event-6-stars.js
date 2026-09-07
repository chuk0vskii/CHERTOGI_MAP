export default {
  id: 6,
  title: 'Вмешательство звезд',
  description: 'Сами боги вмешиваются в судьбу группы, благословляя или показывая свой гнев.',
  checkInfo: 'Все члены группы должны совершить проверку Традиций. Хранитель узлов сравнивает общий результат.',
  type: 'total_check',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, addArrivalBonus, addBonusEvent } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Общий результат проверки Традиций', 0);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'total_80': 'Боги благословляют группу и их нити судьбы изгибаются в лучшую сторону. Все негативные эффекты знака из фазы Чтение знаков перестают действовать, а все положительные эффекты удваиваются.',
        'total_60': 'Боги в раздумье и посему судьба группы натягивается как струна. Чтец знаков делает еще один бросок по таблице знаков, у группы +1 событие в фазе Путь.',
        'total_40': 'Боги недовольны малым поклонением и группу настигает их разочарование. Бросьте по таблице Знаков из фазы Чтение знаков с помехой. У группы также -2 к Прибытию.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'total_40') {
        addArrivalBonus(-2);
      }
      
      if (resultType === 'total_60') {
        html += '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border-left: 3px solid #ffd700; color: #ffd700; font-size: 14px;">';
        html += '⭐ Добавлено бонусное событие в фазе Путь (бросок по таблице знаков)';
        html += '</div>';
        if (typeof addBonusEvent === 'function') {
          addBonusEvent(null);
        }
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
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
