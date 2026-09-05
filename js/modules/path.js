// ============================================================
// ФАЗА ПУТЬ
// ============================================================

import { _supabase } from '../config-module.js';
import { COMMON_EVENTS, ROLES, ROLE_EVENTS, loadGreatBeasts, getRandomGreatBeast } from '../data/events.js';
import { getRandomInt, getEventResult, getResultLabel, getResultClass } from './utils.js';
import { addSignMod, updateDifficulty, getBaseDifficulty, getCurrentSignMod, addArrivalBonus, getArrivalBonus } from './region.js';

const generateBtn = document.getElementById('generateEventsBtn');
const eventsContainer = document.getElementById('eventsContainer');
const commonEventsCount = document.getElementById('commonEventsCount');
const maxRoleEvents = document.getElementById('maxRoleEvents');
const roleEventsCount = document.getElementById('roleEventsCount');
const totalEventsCount = document.getElementById('totalEventsCount');
const regionSelect = document.getElementById('regionSelect');

let currentEvents = [];
let tableCache = {};
let dangerousCreaturesCache = {};

// ============================================================
// ЗАГРУЗКА ТАБЛИЦ ИЗ SUPABASE
// ============================================================

async function getTableData(tableName) {
  try {
    if (tableCache[tableName]) {
      return tableCache[tableName];
    }
    
    console.log('Загрузка таблицы: ' + tableName);
    
    const { data, error } = await _supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Ошибка загрузки ' + tableName + ':', error);
      return null;
    }
    
    console.log('Загружено ' + (data?.length || 0) + ' записей из ' + tableName);
    tableCache[tableName] = data;
    return data;
  } catch (error) {
    console.error('Ошибка:', error);
    return null;
  }
}

// ============================================================
// ЗАГРУЗКА ОПАСНЫХ СУЩЕСТВ ПО ТИПУ МЕСТНОСТИ
// ============================================================

export function getDangerousTableName(terrainType) {
  const mapping = {
    'горы': 'Opasnost_gor',
    'степи': 'Opasnost_stepi',
    'пустыня': 'Opasnost_pustini',
    'джунгли': 'Opasnost_jungle'
  };
  return mapping[terrainType] || 'dangerous_creatures';
}

export async function loadDangerousCreatures(tableName) {
  try {
    if (dangerousCreaturesCache[tableName]) {
      return dangerousCreaturesCache[tableName];
    }
    
    console.log('Загрузка таблицы: '
