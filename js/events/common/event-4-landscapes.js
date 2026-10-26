  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    // ВАЖНО: all_fail проверяем ПЕРВЫМ
    if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
      effects = { arrival: -1 };
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
