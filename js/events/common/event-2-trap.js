  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    // ВАЖНО: сначала проверяем крайние случаи (все успели / все провалили)
    if (successes === total) {
      const hasCritSuccess = values.some(v => v >= difficulty + 5);
      if (hasCritSuccess) {
        resultType = 'crit_success';
        resultText = 'Критический успех!';
      } else {
        resultType = 'all_success';
        resultText = 'Все преуспели!';
      }
    } else if (failures === total) {
      const hasCritFail = values.some(v => v <= difficulty - 5);
      if (hasCritFail) {
        resultType = 'crit_fail';
        resultText = 'Критический провал!';
      } else {
        resultType = 'all_fail';
        resultText = 'Все провалили!';
      }
    } else if (successes >= half) {
      resultType = 'half_success';
      resultText = 'Больше половины преуспели!';
    } else {
      resultType = 'half_fail';
      resultText = 'Больше половины провалили!';
    }
    
    return { resultType, resultText };
  }
