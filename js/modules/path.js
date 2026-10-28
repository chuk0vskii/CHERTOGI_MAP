// ============================================================
// ФАЗА ПУТЬ - ДИСПЕТЧЕР
// ============================================================

import { _supabase } from '../config-module.js';
import { 
  COMMON_EVENTS_MODULES, READER_EVENTS_MODULES, SHADOW_EVENTS_MODULES,
  CLAW_EVENTS_MODULES, EYES_EVENTS_MODULES, PALM_EVENTS_MODULES,
  TABLE_TO_SECTION, getRegionalTableName
} from '../events/index.js';
import { getRandomInt, getResultClass } from './utils.js';
import { 
  addArrivalBonus, getCurrentDifficulty 
} from './region.js';

const generateBtn = document.getElementById('generateEventsBtn');
const eventsContainer = document.getElementById('eventsContainer');
const commonEventsCount = document.getElementById('commonEventsCount');
const maxRoleEvents = document.getElementById('maxRoleEvents');
const roleEventsCount = document.getElementById('roleEventsCount');
const totalEventsCount = document.getElementById('totalEventsCount');
const regionSelect = document.getElementById('regionSelect');

let currentEvents = [];
let tableCache = {};
let eventIdCounter = 0;
let isRendering = false;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function getUniqueId() { return ++eventIdCounter; }
function findEventById(id) { return currentEvents.find(e => e.id === id); }

// ============================================================
// ЗАГРУЗКА ТАБЛИЦ
// ============================================================

async function getTableData(tableName) {
  try {
    if (tableCache[tableName]) return tableCache[tableName];
    const { data, error } = await _supabase.from(tableName).select('*').order('id', { ascending: true });
    if (error) { console.error('Ошибка загрузки ' + tableName + ':', error); return null; }
    tableCache[tableName] = data;
    return data;
  } catch (error) { console.error('Ошибка:', error); return null; }
}

// ============================================================
// ССЫЛКА НА БЕСТИАРИЙ
// ============================================================

function createBeastLink(name, tableName) {
  const encodedName = encodeURIComponent(name);
  let sectionId = TABLE_TO_SECTION[tableName] || 'dangerous_creatures';
  const url = 'bestiary.html?section=' + sectionId + '&beast=' + encodedName;
  return '<a href="' + url + '" target="_blank" style="color: #ffd700; text-decoration: underline; cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color=\'#ffffff\'" onmouseout="this.style.color=\'#ffd700\'">' + name + '</a>';
}

// ============================================================
// РОЛЛ ТАБЛИЦЫ
// ============================================================

async function rollTableInternal(tableName, containerId, fields, isCreature, eventId, resultKey, count) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    let actualTableName = tableName;
    if (tableName === 'opasnost_regional') {
      const selectedOption = regionSelect.options[regionSelect.selectedIndex];
      const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
      actualTableName = getRegionalTableName(terrainType);
      if (!actualTableName) {
        container.innerHTML = '<div style="color: #ff6b6b;">Не удалось определить региональную таблицу</div>';
        container.style.display = 'block';
        return;
      }
    }

    const data = await getTableData(actualTableName);
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="color: #ff6b6b;">Нет данных в таблице</div>';
      container.style.display = 'block';
      return;
    }
    
    const resultsCount = count || 1;
    let html = '';
    
    for (var i = 0; i < resultsCount; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const item = data[randomIndex];
      
      html += '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
      html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат #' + (i + 1) + ': <strong>' + (randomIndex + 1) + '</strong></div>';
      
      fields.forEach(function(field) {
        if (item[field] !== undefined && item[field] !== null) {
          let value = item[field];
          if (isCreature) value = createBeastLink(value, actualTableName);
          
          let label = field === 'name' ? '' : 
                      field === 'description' ? '' : 
                      field === 'pass_method' ? 'Как пройти: ' : 
                      field === 'reward_type' ? 'Что хранят: ' : 
                      field === 'oasis_type' ? 'Оазис: ' : 
                      field === 'mystery' ? 'Тайна: ' : 
                      field === 'effects' ? 'Эффект: ' : 
                      field === 'attunement' ? 'Настройка: ' : '';

          html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5; margin-top: 4px;">' + label + value + '</div>';
        }
      });
      html += '</div>';
    }
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    const event = findEventById(eventId);
    if (event) {
      if (!event.tableResults) event.tableResults = {};
      event.tableResults[resultKey] = { html: html };
    }
    
  } catch (err) {
    console.error('Ошибка:', err);
    container.innerHTML = '<div style="color: #ff6b6b;">Ошибка</div>';
    container.style.display = 'block';
  }
}

// ============================================================
// ГЕНЕРАЦИЯ СОБЫТИЙ
// ============================================================

function getRandomEventByType(type) {
  let module = null;
  let roll = 0;
  
  if (type === 'Общее') {
    roll = getRandomInt(1, 6);
    module = COMMON_EVENTS_MODULES[roll];
  } else if (type === 'Чте
