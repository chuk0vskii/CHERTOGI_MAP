// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getEventResult(roll) {
  if (roll >= 18) return 'crit_success';
  if (roll >= 12) return 'success';
  if (roll >= 6) return 'fail';
  return 'crit_fail';
}

export function getResultLabel(result) {
  var labels = {
    'crit_success': 'Критический успех!',
    'success': 'Успех',
    'fail': 'Провал',
    'crit_fail': 'Критический провал!'
  };
  return labels[result] || '—';
}

export function getResultClass(result) {
  var classes = {
    'crit_success': 'crit-success',
    'success': 'success',
    'fail': 'fail',
    'crit_fail': 'crit-fail'
  };
  return classes[result] || '';
}
