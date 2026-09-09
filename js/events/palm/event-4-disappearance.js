export default {
  id: 4,
  title: 'Исчезновение',
  description: 'Животное группы исчезает ночью. Проверка Ухода за животными чтобы понять причину по оставшимся следам.',
  checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
  type: 'palm',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    // Блок с пояснением (без генерации)
    html += '<div style="margin-bottom: 12px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border-left: 3px solid #ffd700;">';
    html += '<div style="color: rgba(255,255,255,0.6); font-size: 13px;">🔍 Бросьте по таблице Опасные существа зоны (см. в документе края)</div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Ухода за животными (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      const resultType = event.result;
      html += createResult(resultType, event.resultText);
      
      const effects = {
        'success': 'Длань находит его, но раненым.',
        'fail': 'Оно утащено тварью.'
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
