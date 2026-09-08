// ============================================================
// РЕГИСТРАЦИЯ ВСЕХ СОБЫТИЙ
// ============================================================

// --- ОБЩИЕ СОБЫТИЯ ---
import event1 from './common/event-1-sign.js';
import event2 from './common/event-2-trap.js';
import event3 from './common/event-3-ruins.js';
import event4 from './common/event-4-landscapes.js';
import event5 from './common/event-5-oasis.js';
import event6 from './common/event-6-stars.js';

// --- СОБЫТИЯ ЧТЕЦА ЗНАКОВ ---
import reader1 from './reader/event-1-cursed-lands.js';
import reader2 from './reader/event-2-obstacle.js';
import reader3 from './reader/event-3-singing-signs.js';
import reader4 from './reader/event-4-fate.js';
import reader5 from './reader/event-5-false-threads.js';
import reader6 from './reader/event-6-whispering-obo.js';

// --- СОБЫТИЯ ТЕНИ НАРАРА ---
import shadow1 from './shadow/event-1-dangerous-meeting.js';
import shadow2 from './shadow/event-2-veil-cry.js';
import shadow3 from './shadow/event-3-safe-camp.js';
import shadow4 from './shadow/event-4-reality-tear.js';
import shadow5 from './shadow/event-5-trackers.js';
import shadow6 from './shadow/event-6-secret-cache.js';

// --- СОБЫТИЯ КОГТЯ АКРЕПЫ ---
import claw1 from './claw/event-1-spirit-devouring.js';
import claw2 from './claw/event-2-golden-prey.js';
import claw3 from './claw/event-3-traces-of-great.js';
import claw4 from './claw/event-4-poisonous-meal.js';
import claw5 from './claw/event-5-hunting-ambush.js';
import claw6 from './claw/event-6-forbidden-place.js';

// --- СОБЫТИЯ ГЛАЗ ЗВЕЗД ---
import eyes1 from './eyes/event-1-deadly-battle.js';
import eyes2 from './eyes/event-2-they-came-for-you.js';
import eyes3 from './eyes/event-3-horizon-trial.js';
import eyes4 from './eyes/event-4-deadly-weather.js';
import eyes5 from './eyes/event-5-light-in-darkness.js';
import eyes6 from './eyes/event-6-shadow-movement.js';

// --- СОБЫТИЯ ДЛАНИ БАТРИНЫ ---
import palm1 from './palm/event-1-rabies.js';
import palm2 from './palm/event-2-broken-balance.js';
import palm3 from './palm/event-3-herd-fear.js';
import palm4 from './palm/event-4-disappearance.js';
import palm5 from './palm/event-5-heightened-senses.js';
import palm6 from './palm/event-6-gifts-of-sumug.js';

// ============================================================
// РЕЕСТРЫ
// ============================================================

export const COMMON_EVENTS_MODULES = {
  1: event1,
  2: event2,
  3: event3,
  4: event4,
  5: event5,
  6: event6
};

export const READER_EVENTS_MODULES = {
  1: reader1,
  2: reader2,
  3: reader3,
  4: reader4,
  5: reader5,
  6: reader6
};

export const SHADOW_EVENTS_MODULES = {
  1: shadow1,
  2: shadow2,
  3: shadow3,
  4: shadow4,
  5: shadow5,
  6: shadow6
};

export const CLAW_EVENTS_MODULES = {
  1: claw1,
  2: claw2,
  3: claw3,
  4: claw4,
  5: claw5,
  6: claw6
};

export const EYES_EVENTS_MODULES = {
  1: eyes1,
  2: eyes2,
  3: eyes3,
  4: eyes4,
  5: eyes5,
  6: eyes6
};

export const PALM_EVENTS_MODULES = {
  1: palm1,
  2: palm2,
  3: palm3,
  4: palm4,
  5: palm5,
  6: palm6
};

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
  'opasnost_jungle': 'dangerous_swamps',
  'veil_aberrations': 'veil_aberrations'
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
  if (type === 'Коготь_Акрепы') {
    return CLAW_EVENTS_MODULES[id];
  }
  if (type === 'Глаза_Звезд') {
    return EYES_EVENTS_MODULES[id];
  }
  if (type === 'Длань_Батрины') {
    return PALM_EVENTS_MODULES[id];
  }
  return null;
}
