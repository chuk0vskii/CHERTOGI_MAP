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
// РОЛЛ ТАБЛИЦЫ
// ============================================================

export async function rollTable(tableName, containerId) {
  console.log('rollTable вызван: tableName="' + tableName + '"');
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Контейнер не найден: ' + containerId);
    return;
  }

  try {
    console.log('Делаю запрос к таблице: ' + tableName);
    
    const { data, error } = await _supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error('Ошибка запроса к ' + tableName + ':', error);
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid
