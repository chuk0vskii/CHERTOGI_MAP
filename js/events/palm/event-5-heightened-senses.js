  handleCheck: function(event, values, type, difficulty) {
    const animalValue = values[0] || 0;
    const traditionsValue = values[1] || 0;
    
    let resultType = '';
    let resultText = '';
    let effects = null;
    
    const animalSuccess = animalValue >= difficulty;
    const traditionsSuccess = traditionsValue >= difficulty;
    
    // 1. Успех Чтеца Знаков
    if (traditionsSuccess) {
      resultType = 'reader_success';
      resultText = 'Чтец Знаков успешен!';
      effects = null; // «+1 к Прибытию, если последнее событие» — решает мастер
    } 
    // 2. Успех Длани Батрины (если Чтец провалился)
    else if (animalSuccess) {
      resultType = 'palm_success';
      resultText = 'Длань Батрины успешна!';
      effects = null;
    } 
    // 3. Оба провалены
    else {
      resultType = 'both_fail';
      resultText = 'Обе проверки провалены';
      effects = { arrival: -1, events: 1 };
    }
    
    return { resultType, resultText, effects };
  }
