export default {
  id: 6,
  title: 'Движение теней',
  description: 'Глаза замечают странные тени. Проверка Внимательности, если Глаза Звезд владеет силами Вуали, он совершает проверку с преимуществом.',
  checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
  type: 'eyes',
  
  tables: {
    'veil_aberrations': { label: 'Аберрации Вуали', fields: ['name', 'description'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Внимательности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success_5': 'Глаза замечает Детей Вуали, но они обходят группу стороной.',
        'success': 'Глаза будит группу и она избегает встречи.',
        'fail': 'Вы видите существ вуали в числе на усмотрение Хранителя узлов.',
        'fail_5': 'Глаза Звезд чувствует возмущение Вуали, но не успевает поднять группу. Число существ на усмотрение Хранителя узлов.'
      };
      html += createEffect(resultType, effects);
      
      if (resultType === 'success_5' || resultType === 'fail' || resultType === 'fail_5') {
        html += createTableButton('veil_aberrations', event.id, 'extra_veil_aberrations', event);
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
    } else if (value >= difficulty - 4) {
      resultType = 'fail';
      resultText = 'Провал...';
      effects = null;
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
      effects = null;
    }
    
    return { resultType, resultText, effects };
  }
};
