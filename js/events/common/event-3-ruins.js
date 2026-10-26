  handleCheck: function(event, values, type, difficulty) {
    const isSecond = type === 'second';
    
    // ВТОРАЯ ПРОВЕРКА — Тень Нарара
    if (isSecond) {
      const value = values[0] || 0;
      let resultType = '';
      let resultText = '';
      let effects = null;
      
      if (value >= difficulty + 5) {
        resultType = 'success_5';
        resultText = 'Критический успех! (2 артефакта)';
        effects = null;
      } else if (value >= difficulty) {
        resultType = 'success';
        resultText = 'Успех! (1 артефакт)';
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
    
    // ОСНОВНАЯ ПРОВЕРКА — Проверка Искры
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    // ВАЖНО: all_fail проверяем ПЕРВЫМ, иначе failures >= half сработает раньше
    if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
      effects = { arrival: -1 };
    } else if (successes === total) {
      resultType = 'all_or_half_success';
      resultText = 'Все преуспели!';
      effects = { arrival: 1 };
    } else if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
      effects = { arrival: 1 };
    } else {
      resultType = 'half_fail';
      resultText = 'Провал...';
      effects = { arrival: -1 };
    }
    
    return { resultType, resultText, effects };
  }
