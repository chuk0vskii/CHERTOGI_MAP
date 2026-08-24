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
  'Ловушка': {
    table: 'traps',
    fields: ['name', 'description']
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
  'Преграда': {
    table: 'region_obstacles',
    fields: ['name', 'description']
  },
  'Ядовитая трапеза': {
    table: 'parasitic_creatures',
    fields: ['name', 'effect']
  },
  
  // --- Тень Нарара ---
  'Опасная Встреча': {
    table: 'zone_conflicts',
    fields: ['name', 'description']
  },
  'Конфликт Зоны': {
    table: 'zone_conflicts',
    fields: ['name', 'description']
  },
  'Дети Вуали': {
    table: 'veil_children',
    fields: ['name', 'description']
  },
  'Плачь Вуали': {
    table: 'veil_children',
    fields: ['name', 'description']
  },
  'Пролом реальности': {
    table: 'reality_tears',
    fields: ['name', 'description', 'effect']
  },
  'Следопыты': {
    table: 'zone_conflicts',
    fields: ['name', 'description']
  },
  
  // --- Коготь Акрепы ---
  'Запретное место': {
    table: 'slaughter_zones',
    fields: ['name', 'description']
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
  'Свет среди тьмы': {
    table: 'traps',
    fields: ['name', 'description']
  },
  'Движение теней': {
    table: 'veil_children',
    fields: ['name', 'description']
  },
  'Они Пришли за Вами!': {
    table: 'dangerous_creatures',
    fields: ['name', 'description']
  },
  
  // --- Длань Батрины ---
  'Бешенство': {
    table: 'parasitic_creatures',
    fields: ['name', 'effect']
  },
  'Нарушенный Баланс': {
    table: 'deadly_encounters',
    fields: ['name', 'description']
  },
  'Исчезновение': {
    table: 'dangerous_creatures',
    fields: ['name', 'description']
  }
};

// ============================================================
// ТАБЛИЦЫ ДЛЯ ЛОКАЛЬНЫХ ПОД-БРОСКОВ (без Supabase)
// ============================================================

export const RUINS_TABLE = [
  ['Магии', 'Активировать 1к4 рычага', 'Ответы на вопросы'],
  ['Лабиринта', 'Передвинуть правильно 1к6 статуй', 'Историю что пытались скрыть'],
  ['Королей', 'Уничтожить одного сильного стража', 'Сокровища'],
  ['Морхоров', 'Уничтожить 3к4 мелких стражей', 'Запертое существо'],
  ['Вуали', 'Восстановить цепь лучей света', 'Артефакт'],
  ['Меридиров', 'Пройти испытание Искры', 'Знания веков'],
  ['Эхорнуров', 'Пройти испытание Кремня', 'Забытых детей'],
  ['Улунгуров', 'Пролить кровь', 'Чьи-то останки'],
  ['Солнц и Лун', 'Спеть песню на языке архитекторов', 'Имена'],
  ['Звезд', 'Отдать что-то в дар/вернуть предмет на место', 'Опасную магию'],
  ['Глубин', 'Сломать/починить то, что не дает пройти', 'Ключ к другой двери'],
  ['Великанов', 'Произнести нужные слова/звуки/музыку', 'Фрески/пророчество/сказание']
];

export const OASIS_TABLE = [
  ['Горячие источники Шамаса, снимающая 1 метку Тьмы.', 'Время от времени вода прилипает к чаше не выливаясь.
