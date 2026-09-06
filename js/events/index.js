// ============================================================
// РЕГИСТРАЦИЯ ОБЩИХ СОБЫТИЙ
// ============================================================

import event1 from './common/event-1-sign.js';
import event2 from './common/event-2-trap.js';
import event3 from './common/event-3-ruins.js';
import event4 from './common/event-4-landscapes.js';
import event5 from './common/event-5-oasis.js';
import event6 from './common/event-6-stars.js';

export const COMMON_EVENTS_MODULES = {
  1: event1,
  2: event2,
  3: event3,
  4: event4,
  5: event5,
  6: event6
};

// Сюда позже добавятся Чтец и Тень
export const READER_EVENTS_MODULES = {};
export const SHADOW_EVENTS_MODULES = {};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

export const TABLE_TO_SECTION = {
  'traps': 'traps',
  'ruins': 'ruins',
  'oasis_mysteries': 'oasis_mysteries',
  'region_curses': 'region_curses',
  'region_obstacles': 'region_obstacles',
  'great_beasts': 'great_beasts',
  'zone_conflicts': 'zone_conflicts',
  'veil_children': 'veil_aberrations',
  'reality_tears': 'reality_tears',
  'parasitic_creatures': 'parasitic_creatures',
  'slaughter_zones': 'slaughter_zones',
  'storm_eyes': 'storm_eyes',
  'deadly_encounters': 'deadly_encounters',
  'opasnost_pustini': 'dangerous_desert',
  'opasnost_stepi': 'dangerous_steppes',
  'opasnost_gor': 'dangerous_mountains',
  'opasnost_jungle': 'dangerous_swamps'
};

export function getRegionalTableName(terrainType) {
  const mapping = {
    'пустыня': 'opasnost_pustini',
    'степи': 'opasnost_stepi',
    'горы': 'opasnost_gor',
    'джунгли': 'opasnost_jungle'
  };
  return mapping[terrainType] || null;
}

export function getEventModule(id, type) {
  if (type === 'Общее' || type === 'Общее (бонусное)') {
    return COMMON_EVENTS_MODULES[id];
  }
  if (type === 'Чтец_Знаков') {
    return READER_EVENTS_MODULES[id];
  }
  if (type === 'Тень_Нарара') {
    return SHADOW_EVENTS_MODULES[id];
  }
  return null;
}
