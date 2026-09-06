// ============================================================
// ФАЗА ПУТЬ
// ============================================================

import { _supabase } from '../config-module.js';
import { 
  COMMON_EVENTS, READER_EVENTS, SHADOW_EVENTS,
  getRegionalTableName, TABLE_TO_SECTION 
} from '../data/events.js';
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
let arrivalBonus = 0;
let eventCounter = 0;

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
// ФУНКЦИЯ СОЗДАНИЯ ССЫЛКИ НА СУЩЕСТВО В БЕСТИАРИИ
// ============================================================

function createBeastLink(name, tableName) {
  const encodedName = encodeURIComponent(name);
  let sectionId = TABLE_TO_SECTION[tableName] || 'dangerous_creatures';
  const url = 'bestiary.html?section=' + sectionId + '&beast=' + encodedName;
  return '<a href="' + url + '" target="_blank" style="color: #ffd700; text-decoration: underline; cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color=\'#ffffff\'" onmouseout="this.style.color=\'#ffd700\'">' + name + '</a>';
}

// ============================================================
// ФУНКЦИЯ РОЛЛА ТАБЛИЦЫ
// ============================================================

async function rollTable(tableName, containerId, fields, isCreature, sectionId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Контейнер не найден: ' + containerId);
    return;
  }

  try {
    let actualTableName = tableName;
    
    // Региональная таблица
    if (tableName === 'opasnost_regional') {
      const selectedOption = regionSelect.options[regionSelect.selectedIndex];
      const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
      actualTableName = getRegionalTableName(terrainType);
      if (!actualTableName) {
        container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Не удалось определить региональную таблицу</div>';
        container.style.display = 'block';
        return;
      }
    }

    const { data, error } = await _supabase
      .from(actualTableName)
      .select('*');
    
    if (error || !data || data.length === 0) {
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Нет данных в таблице</div>';
      container.style.display = 'block';
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * data.length);
    const item = data[randomIndex];
    
    let html = '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
    html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат: <strong>' + (randomIndex + 1) + '</strong></div>';
    
    if (fields && fields.length > 0) {
      fields.forEach(function(field) {
        if (item[field] !== undefined && item[field] !== null) {
          let value = item[field];
          if (isCreature) {
            value = createBeastLink(value, actualTableName);
          }
          const label = field === 'name' ? '' : field === 'pass_method' ? 'Как пройти: ' : field === 'reward_type' ? 'Что хранят: ' : field === 'oasis_type' ? 'Оазис: ' : field === 'mystery' ? 'Тайна: ' : '';
          html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">' + label + value + '</div>';
        }
      });
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
    
  } catch (err) {
    console.error('Ошибка:', err);
    container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Ошибка</div>';
    container.style.display = 'block';
  }
}

// ============================================================
// ГЕНЕРАЦИЯ СОБЫТИЙ
// ============================================================

export async function generatePathEvents() {
  console.log('generatePathEvents вызван!');
  
  const selectedOption = regionSelect.options[regionSelect.selectedIndex];
  
  if (!regionSelect.value || regionSelect.value === '' || !selectedOption || selectedOption.value === '') {
    alert('Сначала выберите край!');
    return;
  }

  const common = parseInt(selectedOption.dataset.commonEvents) || 0;
  const maxRole = parseInt(selectedOption.dataset.maxRoleEvents) || 0;
  const roleBonus = parseInt(selectedOption.dataset.roleBonus) || 0;

  let roleCount = 0;
  let roleDisplay = '0';
  let rollResult = 0;
  let bonusDisplay = '';
  
  if (maxRole > 0) {
    rollResult = getRandomInt(1, maxRole);
    roleCount = rollResult + roleBonus;
    bonusDisplay = roleBonus > 0 ? ' +' + roleBonus : roleBonus < 0 ? ' ' + roleBonus : '';
    roleDisplay = '1d' + maxRole + ' = ' + rollResult + bonusDisplay + ' → ' + roleCount;
  }

  const totalEvents = common + roleCount;

  commonEventsCount.textContent = common;
  maxRoleEvents.textContent = maxRole;
  roleEventsCount.textContent = roleDisplay;
  totalEventsCount.textContent = totalEvents;

  currentEvents = generateEventList(common, roleCount);
  renderEvents(currentEvents);
}

function generateEventList(commonCount, roleCount) {
  const events = [];

  // Общие события
  for (var i = 0; i < commonCount; i++) {
    const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
    const eventData = COMMON_EVENTS[roll];
    const eventCopy = createEventCopy(eventData, 'Общее', roll + 1);
    events.push(eventCopy);
  }

  // Ролевые события
  const roles = ['Чтец_Знаков', 'Тень_Нарара'];
  const roleEventsMap = {
    'Чтец_Знаков': READER_EVENTS,
    'Тень_Нарара': SHADOW_EVENTS
  };

  for (var j = 0; j < roleCount; j++) {
    const roleIndex = getRandomInt(0, roles.length - 1);
    const role = roles[roleIndex];
    const roleEvents = roleEventsMap[role] || READER_EVENTS;
    const roll = getRandomInt(0, roleEvents.length - 1);
    const eventData = roleEvents[roll];
    const eventCopy = createEventCopy(eventData, role, roll + 1);
    events.push(eventCopy);
  }

  // Перемешиваем
  for (var k = events.length - 1; k > 0; k--) {
    const j2 = Math.floor(Math.random() * (k + 1));
    [events[k], events[j2]] = [events[j2], events[k]];
  }

  return events;
}

function createEventCopy(eventData, type, roll) {
  return {
    type: type,
    data: { ...eventData },
    roll: roll,
    checked: false,
    result: null,
    secondChecked: false,
    secondResult: null,
    tableResults: {},
    bars: [],
    secondBars: [],
    isBonus: false,
    color: ''
  };
}

// ============================================================
// ОТРИСОВКА
// ============================================================

function renderEvents(events) {
  if (!events || events.length === 0) {
    eventsContainer.innerHTML = '<div class="no-events">Нет событий для этого края</div>';
    return;
  }

  eventsContainer.innerHTML = events.map(function(event, index) {
    const config = event.data.config;
    const bgColor = event.color || (event.isBonus ? 'rgba(255,215,0,0.08)' : '');
    const borderColor = event.isBonus ? '2px solid rgba(255,215,0,0.3)' : '1px solid rgba(74,14,14,0.2)';
    
    let html = '<div class="event-card" data-index="' + index + '" style="background: ' + bgColor + '; border: ' + borderColor + ';">';
    html += '<div class="event-header">';
    html += '<span class="event-type">' + (event.isBonus ? '⭐ ' : '') + event.type + '</span>';
    html += '<span class="event-roll">Бросок: <strong>' + event.roll + '</strong></span>';
    html += '</div>';
    html += '<div class="event-text">';
    html += '<strong>' + event.data.title + '</strong><br>';
    html += event.data.description;
    if (event.data.checkInfo) {
      html += '<br><span class="check-info">' + event.data.checkInfo + '</span>';
    }
    html += '</div>';
    
    // Генерация контента в зависимости от типа события
    if (config) {
      html += renderEventContent(event, index, config);
    }
    
    // Основная проверка
    if (config && config.check && config.check.bars) {
      html += renderCheckBars(event, index, 'main', config.check);
    }
    
    // Вторая проверка (для Древних Руин)
    if (config && config.secondCheck) {
      html += renderSecondCheck(event, index, config.secondCheck);
    }
    
    html += '</div>';
    return html;
  }).join('');

  attachEventHandlers();
}

function renderEventContent(event, index, config) {
  let html = '';
  
  // Кнопка таблицы
  if (config.table) {
    const containerId = 'table-result-' + index + '-' + Date.now();
    const isCreature = config.table.isCreature || false;
    const fields = config.table.fields || ['name'];
    const tableName = config.table.name;
    const label = config.table.label || 'Таблица';
    
    html += '<div style="margin-top: 8px;">';
    html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
    html += 'Бросить по ' + label;
    html += '</button>';
    html += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
    html += '</div>';
  }
  
  // Результаты проверки
  if (event.checked && config.check && config.check.results) {
    const result = event.result;
    const results = config.check.results;
    let matched = false;
    
    for (var i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.condition === 'all_success' && result === 'all_success') {
        html += '<div class="event-result visible success">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'half_success' && result === 'half_success') {
        html += '<div class="event-result visible success">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'all_or_half_success' && (result === 'all_success' || result === 'half_success')) {
        html += '<div class="event-result visible success">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'half_fail' && result === 'half_fail') {
        html += '<div class="event-result visible fail">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'all_fail' && result === 'all_fail') {
        html += '<div class="event-result visible crit-fail">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'success' && (result === 'success' || result === 'crit_success')) {
        html += '<div class="event-result visible success">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'fail' && (result === 'fail' || result === 'crit_fail')) {
        html += '<div class="event-result visible fail">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'success_5' && result === 'crit_success') {
        html += '<div class="event-result visible crit-success">' + r.message + '</div>';
        matched = true;
        break;
      } else if (r.condition === 'fail_5' && result === 'crit_fail') {
        html += '<div class="event-result visible crit-fail">' + r.message + '</div>';
        matched = true;
        break;
      }
    }
  }
  
  return html;
}

function renderCheckBars(event, index, type, checkConfig) {
  const isSecond = type === 'second';
  const prefix = isSecond ? 'second-' : '';
  const bars = isSecond ? event.secondBars || [] : event.bars || [];
  const config = checkConfig || {};
  const barsConfig = config.bars || { type: 'single' };
  
  let html = '<div class="event-check-row">';
  
  if (barsConfig.type === 'single') {
    html += '<label for="' + prefix + 'check-' + index + '">' + (config.label || 'Значение проверки:') + '</label>';
    html += '<input type="number" id="' + prefix
