// ============================================================
// ОБРАБОТКА ПРОВЕРКИ
// ============================================================

function handleCheck(index, type) {
  const event = currentEvents[index];
  if (!event) return;

  const isSecond = type === 'second';
  const inputId = isSecond ? `second-check-${index}` : `check-${index}`;
  const resultId = isSecond ? `second-result-${index}` : `result-${index}`;
  const effectId = isSecond ? `second-effect-${index}` : `effect-${index}`;

  const input = document.getElementById(inputId);
  if (!input) return;
  
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение проверки (минимум 1)');
    return;
  }

  const result = getEventResult(value);
  
  if (isSecond) {
    event.secondResult = result;
    event.secondChecked = true;
  } else {
    event.result = result;
    event.checked = true;
  }

  const resultDiv = document.getElementById(resultId);
  const effectDiv = document.getElementById(effectId);

  if (!resultDiv || !effectDiv) return;

  resultDiv.textContent = `🎲 Результат: ${value} — ${getResultLabel(result)}`;
  resultDiv.className = `event-result visible ${getResultClass(result)}`;

  let effects;
  if (isSecond && event.data.secondEffects) {
    effects = event.data.secondEffects;
  } else if (!isSecond && event.data.effects) {
    effects = event.data.effects;
  } else {
    effects = event.data.effects;
  }
  
  if (effects) {
    let effectText = '';
    let effectClass = '';
    
    switch(result) {
      case 'crit_success':
        effectText = effects.crit_success || effects.success || 'Критический успех!';
        effectClass = 'effect-crit';
        break;
      case 'success':
        effectText = effects.success || 'Успех!';
        effectClass = 'effect-success';
        break;
      case 'fail':
        effectText = effects.fail || 'Провал...';
        effectClass = 'effect-fail';
        break;
      case 'crit_fail':
        effectText = effects.crit_fail || effects.fail || 'Критический провал!';
        effectClass = 'effect-fail';
        break;
    }
    
    effectDiv.innerHTML = `<span class="${effectClass}">⚡ ${effectText}</span>`;
    effectDiv.className = 'event-effect visible';
    
    // Проверяем изменение сложности пути
    const diffMatch = effectText.match(/сложность\s*пути\s*([+-])\s*(\d+)/i);
    if (diffMatch) {
      const sign = diffMatch[1] === '+' ? 1 : -1;
      const amount = parseInt(diffMatch[2]);
      addSignMod(sign * amount);
      
      const notif = document.createElement('div');
      notif.style.cssText = 'margin-top: 6px; font-size: 13px; color: #ffd700;';
      notif.textContent = `🔄 Сложность пути изменена: ${getBaseDifficulty() + getCurrentSignMod()}`;
      effectDiv.appendChild(notif);
    }
    
    // Проверяем изменение Прибытия (кварны)
    // Ищем фразы: "+1 на Прибытие", "-1 на Прибытие", "+2 на Прибытие" и т.д.
    const arrivalMatch = effectText.match(/([+-])\s*(\d+)\s+на\s+Прибытие/i);
    if (arrivalMatch) {
      const sign = arrivalMatch[1] === '+' ? 1 : -1;
      const amount = parseInt(arrivalMatch[2]);
      addArrivalBonus(sign * amount);
      
      const notif = document.createElement('div');
      notif.style.cssText = 'margin-top: 6px; font-size: 13px; color: #51cf66;';
      notif.textContent = `🏆 Кварны прибытия изменены: ${getArrivalBonus()}`;
      effectDiv.appendChild(notif);
    }
  }
}
