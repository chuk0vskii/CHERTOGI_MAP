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
  const labels = {
    'crit_success': 'Критический успех! 🎉',
    'success': 'Успех ✅',
    'fail': 'Провал ❌',
    'crit_fail': 'Критический провал! 💀'
  };
  return labels[result] || '—';
}

export function getResultClass(result) {
  const classes = {
    'crit_success': 'crit-success',
    'success': 'success',
    'fail': 'fail',
    'crit_fail': 'crit-fail'
  };
  return classes[result] || '';
}

// ============================================================
// ГЕНЕРАЦИЯ ПОД-БРОСКОВ
// ============================================================

import { RUINS_TABLE, OASIS_TABLE } from '../data/tables.js';

export function generateRuins() {
  const index = getRandomInt(0, RUINS_TABLE.length - 1);
  const ruins = RUINS_TABLE[index];
  return {
    roll: index + 1,
    type: ruins[0],
    pass: ruins[1],
    reward: ruins[2],
    fullText: `Тип руин: ${ruins[0]} | Как пройти: ${ruins[1]} | Что хранят: ${ruins[2]}`
  };
}

export function generateOasis() {
  const index = getRandomInt(0, OASIS_TABLE.length - 1);
  const oasis = OASIS_TABLE[index];
  return {
    roll: index + 1,
    type: oasis[0],
    mystery: oasis[1],
    fullText: `Оазис: ${oasis[0]} | Загадка: ${oasis[1]}`
  };
}
