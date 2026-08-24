// ============================================================
// КОНФИГУРАЦИЯ ТАБЛИЦ ДЛЯ ПОД-БРОСКОВ
// ============================================================

export const EVENT_TABLES = {
  // --- Общие события ---
  'Древние Руины': {
    table: 'ruins',
    fields: ['name', 'pass_method', 'reward_type']
  },
  'Невероятный Оазис': {
    table: 'oasis_mysteries',
    fields: ['oasis_type', 'mystery']
  },
  
  // --- Чтец Знаков ---
  'Проклятые земли': {
    table: 'region_curses',
    fields: ['name', 'effect']
  },
  'Следы Великих': {
    table: 'great_beasts',
    fields: ['name', 'description', 'treasure']
  },
  'Опасная Встреча': {
    table: 'deadly_encounters',
    fields: ['name', 'description']
  },
  'Преграда': {
    table: 'region_obstacles',
    fields: ['name', 'description']
  },
  'Ядовитая трапеза': {
    table: 'parasitic_creatures',
    fields: ['name', 'effect']
  },
  
  // --- Тень Нарара ---
  'Конфликт Зоны': {
    table: 'zone_conflicts',
    fields: ['name', 'description']
  },
  'Дети Вуали': {
    table: 'veil_children',
    fields: ['name', 'description']
  },
  'Пролом реальности': {
    table: 'reality_tears',
    fields: ['name', 'description', 'effect']
  },
  
  // --- Глаза Звезд ---
  'Смертельная погода': {
    table: 'storm_eyes',
    fields: ['name', 'description', 'effects']
  },
  'Испытание на Горизонте': {
    table: 'slaughter_zones',
    fields: ['name', 'description']
  },
  
  // --- Ловушки (добавляем) ---
  'Ловушка': {
    table: 'traps',
    fields: ['name', 'description']
  }
};
