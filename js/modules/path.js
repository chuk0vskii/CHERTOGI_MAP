// ============================================================
// ФАЗА ПУТЬ
// ============================================================

import { _supabase } from '../config-module.js';
import { 
  COMMON_EVENTS, READER_EVENTS, SHADOW_EVENTS,
  getRegionalTableName, TABLE_TO_SECTION 
} from '../data/events.js';
import { getRandomInt, getResultLabel, getResultClass } from './utils.js';
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
let eventIdCounter = 0;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function getUniqueId() {
  return ++eventIdCounter;
}

function findEventById(id) {
  return currentEvents.find(e => e.id === id);
}

// ============================================================
// ЗАГРУЗКА ТАБЛИЦ
// ============================================================

async function getTableData(tableName) {
  try {
    if (tableCache[tableName]) {
      return tableCache[tableName];
    }
    
    const { data, error } = await _supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Ошибка загрузки ' + tableName + ':', error);
      return null;
    }
    
    tableCache[tableName] = data;
    return data;
  } catch (error) {
    console.error('Ошибка:', error);
    return null;
  }
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
// ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА ТАБЛИЦЫ
// ============================================================

function displayTableResult(container, item, fields, isCreature, actualTableName, randomIndex, eventId, resultKey) {
  let html = '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
  html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат: <strong>' + (randomIndex + 1) + '</strong></div>';
  
  fields.forEach(function(field) {
    if (item[field] !== undefined && item[field] !== null) {
      let value = item[field];
      if (isCreature) {
        value = createBeastLink(value, actualTableName);
      }
      const label = field === 'name' ? '' : 
                    field === 'pass_method' ? 'Как пройти: ' : 
                    field === 'reward_type' ? 'Что хранят: ' : 
                    field === 'oasis_type' ? 'Оазис: ' : 
                    field === 'mystery' ? 'Тайна: ' : '';
      html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">' + label + value + '</div>';
    }
  });
  
  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';
  
  const event = findEventById(eventId);
  if (event) {
    if (!event.tableResults) event.tableResults = {};
    event.tableResults[resultKey] = {
      html: html,
      item: item,
      actualTableName: actualTableName,
      randomIndex: randomIndex,
      fields: fields,
      isCreature: isCreature
    };
  }
}

// ============================================================
// РОЛЛ ТАБЛИЦЫ
// ============================================================

async function rollTableInternal(tableName, containerId, fields, isCreature, eventId, resultKey) {
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
    
    const randomIndex = Math.floor(Math.random() * data.length);
    const item = data[randomIndex];
    
    displayTableResult(container, item, fields, isCreature, actualTableName, randomIndex, eventId, resultKey);
    
  } catch (err) {
    console.error('Ошибка:', err);
    container.innerHTML = '<div style="color: #ff6b6b;">Ошибка</div>';
    container.style.display = 'block';
  }
}

// ============================================================
// ГЕНЕРАЦИЯ СОБЫТИЙ
// ============================================================

export async function generatePathEvents() {
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
  
  if (maxRole > 0) {
    const rollResult = getRandomInt(1, maxRole);
    roleCount = rollResult + roleBonus;
    const bonusDisplay = roleBonus > 0 ? ' +' + roleBonus : roleBonus < 0 ? ' ' + roleBonus : '';
    roleDisplay = '1d' + maxRole + ' = ' + rollResult + bonusDisplay + ' → ' + roleCount;
  }

  const totalEvents = common + roleCount;
  commonEventsCount.textContent = common;
  maxRoleEvents.textContent = maxRole;
  roleEventsCount.textContent = roleDisplay;
  totalEventsCount.textContent = totalEvents;

  currentEvents = [];
  const events = generateEventList(common, roleCount);
  
  events.forEach(function(e) {
    e.id = getUniqueId();
    e.tableResults = {};
    e.secondTableResults = {};
    e.bars = [];
    e.secondBars = [];
    e.checked = false;
    e.result = null;
    e.resultText = null;
    e.secondChecked = false;
    e.secondResult = null;
    e.secondResultText = null;
  });
  
  currentEvents = events;
  renderEvents();
}

function generateEventList(commonCount, roleCount) {
  const events = [];

  for (var i = 0; i < commonCount; i++) {
    const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
    const eventData = COMMON_EVENTS[roll];
    const eventCopy = { data: eventData, type: 'Общее', roll: roll + 1, isBonus: false };
    events.push(eventCopy);
  }

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
    const eventCopy = { data: eventData, type: role, roll: roll + 1, isBonus: false };
    events.push(eventCopy);
  }

  for (var k = events.length - 1; k > 0; k--) {
    const j2 = Math.floor(Math.random() * (k + 1));
    [events[k], events[j2]] = [events[j2], events[k]];
  }

  return events;
}

function addBonusEvent() {
  const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
  const eventData = COMMON_EVENTS[roll];
  const eventCopy = { 
    data: eventData, 
    type: 'Общее (бонусное)', 
    roll: roll + 1, 
    isBonus: true,
    id: getUniqueId(),
    tableResults: {},
    secondTableResults: {},
    bars: [],
    secondBars: [],
    checked: false,
    result: null,
    resultText: null,
    secondChecked: false,
    secondResult: null,
    secondResultText: null
  };
  currentEvents.push(eventCopy);
  renderEvents();
}

// ============================================================
// ОТРИСОВКА
// ============================================================

function renderEvents() {
  if (!currentEvents || currentEvents.length === 0) {
    eventsContainer.innerHTML = '<div class="no-events">Нет событий для этого края</div>';
    return;
  }

  let html = '';
  
  currentEvents.forEach(function(event) {
    const config = event.data.config;
    const bgColor = event.isBonus ? 'rgba(255,215,0,0.08)' : '';
    const borderColor = event.isBonus ? '2px solid rgba(255,215,0,0.3)' : '1px solid rgba(74,14,14,0.2)';
    const eventId = event.id;
    
    html += '<div class="event-card" data-id="' + eventId + '" style="background: ' + bgColor + '; border: ' + borderColor + ';">';
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
    
    // Основная таблица события
    if (config && config.table) {
      const containerId = 'table-result-' + eventId;
      const isCreature = config.table.isCreature || false;
      const fields = config.table.fields || ['name'];
      const tableName = config.table.name;
      const label = config.table.label || 'Таблица';
      const resultKey = 'main_' + tableName;
      
      html += '<div style="margin-top: 8px;">';
      html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" data-event-id="' + eventId + '" data-result-key="' + resultKey + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
      html += 'Бросить по ' + label;
      html += '</button>';
      if (event.tableResults && event.tableResults[resultKey]) {
        html += '<div id="' + containerId + '" style="display: block; margin-top: 6px;">' + event.tableResults[resultKey].html + '</div>';
      } else {
        html += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
      }
      html += '</div>';
    }
    
    // Дополнительная таблица в эффекте (например, для Проклятых земель)
    if (event.checked && config && config.check && config.check.extraTables) {
      const extraTables = config.check.extraTables;
      const resultType = event.result;
      
      for (var key in extraTables) {
        if (key === resultType) {
          const et = extraTables[key];
          const containerId = 'extra-table-' + eventId + '-' + key;
          const tableName = et.table;
          const label = et.label || 'Таблица';
          const fields = et.fields || ['name'];
          const isCreature = et.isCreature || false;
          const resultKeyTable = 'extra_' + tableName;
          
          html += '<div style="margin-top: 8px;">';
          html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" data-event-id="' + eventId + '" data-result-key="' + resultKeyTable + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
          html += 'Бросить по ' + label;
          html += '</button>';
          if (event.tableResults && event.tableResults[resultKeyTable]) {
            html += '<div id="' + containerId + '" style="display: block; margin-top: 6px;">' + event.tableResults[resultKeyTable].html + '</div>';
          } else {
            html += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
          }
          html += '</div>';
        }
      }
    }
    
    // РЕЗУЛЬТАТ ПРОВЕРКИ
    if (event.checked) {
      const resultType = event.result;
      const resultText = event.resultText || getResultLabel(resultType);
      const resultClass = getResultClass(resultType);
      
      if (resultText) {
        html += '<div class="event-result visible ' + resultClass + '">' + resultText + '</div>';
      }
      
      // Эффекты проверки
      if (config && config.check && config.check.results) {
        const results = config.check.results;
        let foundEffect = false;
        for (var i = 0; i < Object.keys(results).length; i++) {
          const key = Object.keys(results)[i];
          const r = results[key];
          let conditionMet = false;
          
          if (key === resultType) conditionMet = true;
          
          if (conditionMet) {
            html += '<div class="event-effect visible">' + r + '</div>';
            foundEffect = true;
            break;
          }
        }
      }
    }
    
    // Бары для проверки
    if (config && config.check && config.check.bars) {
      html += renderCheckBars(event, 'main', config.check);
    }
    
    // Вторая проверка
    if (config && config.secondCheck) {
      html += renderSecondCheck(event, config.secondCheck);
    }
    
    html += '</div>';
  });
  
  eventsContainer.innerHTML = html;
  attachEventHandlers();
}

function renderCheckBars(event, type, checkConfig) {
  const isSecond = type === 'second';
  const prefix = isSecond ? 'second-' : '';
  const bars = isSecond ? (event.secondBars || []) : (event.bars || []);
  const config = checkConfig || {};
  const barsConfig = config.bars || { type: 'single' };
  const eventId = event.id;
  
  let html = '<div class="event-check-row">';
  
  if (barsConfig.type === 'single') {
    html += '<label for="' + prefix + 'check-' + eventId + '">' + (config.label || 'Значение проверки:') + '</label>';
    html += '<input type="number" id="' + prefix + 'check-' + eventId + '" min="1" max="30" value="10" class="check-input" data-event-id="' + eventId + '" data-type="' + type + '">';
    html += '<button class="btn-check' + (isSecond ? '-second' : '') + '" data-event-id="' + eventId + '" data-type="' + type + '">Проверить</button>';
  } else if (barsConfig.type === 'multiple') {
    html += '<div style="width:100%;">';
    html += '<label>' + (config.label || 'Значения проверки:') + '</label>';
    
    if (bars.length === 0) {
      bars.push({ value: 10 });
    }
    
    bars.forEach(function(bar, idx) {
      html += '<div style="display:flex; align-items:center; gap:8px; margin-top:6px;">';
      html += '<input type="number" class="check-input bar-input" data-event-id="' + eventId + '" data-type="' + type + '" data-bar="' + idx + '" min="1" max="30" value="' + (bar.value || 10) + '" style="width:80px;">';
      if (bars.length > 1) {
        html += '<button class="btn-remove-bar" data-event-id="' + eventId + '" data-type="' + type + '" data-bar="' + idx + '" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:16px;">✕</button>';
      }
      html += '</div>';
    });
    
    html += '<button class="btn-add-bar" data-event-id="' + eventId + '" data-type="' + type + '" style="margin-top:6px; background:transparent; border:1px solid rgba(255,215,0,0.2); color:#ffd700; padding:2px 12px; border-radius:4px; cursor:pointer; font-size:12px;">+ Добавить результат</button>';
    html += '<button class="btn-check-multiple" data-event-id="' + eventId + '" data-type="' + type + '" style="margin-top:6px; margin-left:8px; background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:4px 16px; border-radius:4px; cursor:pointer; font-size:13px;">Проверить все</button>';
    html += '</div>';
  }
  
  html += '</div>';
  
  if (isSecond && event.secondChecked) {
    const resultType = event.secondResult;
    const resultText = event.secondResultText || getResultLabel(resultType);
    const resultClass = getResultClass(resultType);
    if (resultText) {
      html += '<div class="event-result visible ' + resultClass + '">' + resultText + '</div>';
    }
    if (config && config.results) {
      const results = config.results;
      for (var i = 0; i < Object.keys(results).length; i++) {
        const key = Object.keys(results)[i];
        if (key === resultType) {
          html += '<div class="event-effect visible">' + results[key] + '</div>';
          break;
        }
      }
    }
  }
  
  return html;
}

function renderSecondCheck(event, secondConfig) {
  const eventId = event.id;
  let html = '<div class="second-check-section">';
  
  if (secondConfig.table) {
    const containerId = 'second-table-result-' + eventId;
    const isCreature = secondConfig.table.isCreature || false;
    const fields = secondConfig.table.fields || ['name'];
    const tableName = secondConfig.table.name;
    const label = secondConfig.table.label || 'Таблица';
    const resultKey = 'second_' + tableName;
    
    html += '<div style="margin-top: 8px;">';
    html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" data-event-id="' + eventId + '" data-result-key="' + resultKey + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
    html += 'Бросить по ' + label;
    html += '</button>';
    if (event.secondTableResults && event.secondTableResults[resultKey]) {
      html += '<div id="' + containerId + '" style="display: block; margin-top: 6px;">' + event.secondTableResults[resultKey].html + '</div>';
    } else {
      html += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
    }
    html += '</div>';
  }
  
  html += renderCheckBars(event, 'second', secondConfig);
  
  html += '</div>';
  return html;
}

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================

function attachEventHandlers() {
  eventsContainer.removeEventListener('click', handleClick);
  eventsContainer.removeEventListener('input', handleInput);
  eventsContainer.removeEventListener('keydown', handleKeydown);
  
  eventsContainer.addEventListener('click', handleClick);
  eventsContainer.addEventListener('input', handleInput);
  eventsContainer.addEventListener('keydown', handleKeydown);
}

function handleClick(e) {
  const target = e.target;
  
  if (target.classList.contains('btn-check') && !target.classList.contains('btn-check-second') && !target.classList.contains('btn-check-multiple')) {
    const eventId = parseInt(target.dataset.eventId);
    const type = target.dataset.type || 'main';
    handleCheck(eventId, type);
    return;
  }
  
  if (target.classList.contains('btn-check-second')) {
    const eventId = parseInt(target.dataset.eventId);
    handleCheck(eventId, 'second');
    return;
  }
  
  if (target.classList.contains('btn-check-multiple')) {
    const eventId = parseInt(target.dataset.eventId);
    const type = target.dataset.type || 'main';
    handleMultipleCheck(eventId, type);
    return;
  }
  
  if (target.classList.contains('btn-add-bar')) {
    const eventId = parseInt(target.dataset.eventId);
    const type = target.dataset.type || 'main';
    addBar(eventId, type);
    return;
  }
  
  if (target.classList.contains('btn-remove-bar')) {
    const eventId = parseInt(target.dataset.eventId);
    const type = target.dataset.type || 'main';
    const barIdx = parseInt(target.dataset.bar);
    removeBar(eventId, type, barIdx);
    return;
  }
  
  if (target.classList.contains('btn-roll-table')) {
    const tableName = target.dataset.table;
    const containerId = target.dataset.container;
    const fieldsStr = target.dataset.fields || 'name';
    const fields = fieldsStr.split(',');
    const isCreature = target.dataset.creature === 'true';
    const eventId = parseInt(target.dataset.eventId);
    const resultKey = target.dataset.resultKey || containerId;
    rollTableInternal(tableName, containerId, fields, isCreature, eventId, resultKey);
    return;
  }
}

function handleInput(e) {
  const target = e.target;
  if (target.classList.contains('check-input') || target.classList.contains('bar-input')) {
    const eventId = parseInt(target.dataset.eventId);
    const type = target.dataset.type || 'main';
    const barIdx = parseInt(target.dataset.bar);
    const event = findEventById(eventId);
    if (!event) return;
    
    const isSecond = type === 'second';
    const bars = isSecond ? event.secondBars : event.bars;
    if (bars && !isNaN(barIdx) && bars[barIdx]) {
      bars[barIdx].value = parseInt(target.value) || 10;
    }
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    const target = e.target;
    if (target.classList.contains('check-input') || target.classList.contains('bar-input')) {
      const btn = target.closest('.event-check-row').querySelector('.btn-check, .btn-check-second, .btn-check-multiple');
      if (btn) btn.click();
    }
  }
}

// ============================================================
// ЛОГИКА ПРОВЕРОК
// ============================================================

function handleCheck(eventId, type) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const isSecond = type === 'second';
  const prefix = isSecond ? 'second-' : '';
  
  const input = document.getElementById(prefix + 'check-' + eventId);
  if (!input) return;
  
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение (минимум 1)');
    return;
  }
  
  processCheck(eventId, type, [value]);
}

function handleMultipleCheck(eventId, type) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const inputs = document.querySelectorAll('.bar-input[data-event-id="' + eventId + '"][data-type="' + type + '"]');
  const values = [];
  
  inputs.forEach(function(input) {
    const val = parseInt(input.value);
    if (!isNaN(val) && val >= 1) {
      values.push(val);
    }
  });
  
  if (values.length === 0) {
    alert('Введите хотя бы одно значение');
    return;
  }
  
  processCheck(eventId, type, values);
}

function addBar(eventId, type) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const isSecond = type === 'second';
  const bars = isSecond ? event.secondBars : event.bars;
  if (!bars) return;
  
  if (bars.length >= 6) {
    alert('Максимум 6 результатов');
    return;
  }
  
  bars.push({ value: 10 });
  renderEvents();
}

function removeBar(eventId, type, barIdx) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const isSecond = type === 'second';
  const bars = isSecond ? event.secondBars : event.bars;
  if (!bars || bars.length <= 1) return;
  
  bars.splice(barIdx, 1);
  renderEvents();
}

// ============================================================
// ОБРАБОТКА ПРОВЕРКИ
// ============================================================

function processCheck(eventId, type, values) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const isSecond = type === 'second';
  const config = isSecond ? event.data.config?.secondCheck : event.data.config?.check;
  if (!config) {
    console.error('Конфиг проверки не найден для события', eventId);
    return;
  }
  
  const difficulty = config.difficulty || 12;
  const results = config.results || {};
  const effects = config.effects || {};
  
  let resultType = '';
  
  // Проверка типа total_check (Вмешательство звезд)
  if (event.data.config?.type === 'total_check') {
    const totalValue = values[0] || 0;
    if (totalValue >= 80) {
      resultType = 'total_80';
    } else if (totalValue >= 60) {
      resultType = 'total_60';
    } else {
      resultType = 'total_40';
    }
  } else {
    // Обычная проверка
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    // Определяем тип результата
    if (successes === total) {
      resultType = 'all_success';
    } else if (successes >= half) {
      resultType = 'half_success';
    } else if (failures >= half) {
      resultType = 'half_fail';
    } else if (failures === total) {
      resultType = 'all_fail';
    } else {
      // fallback для одиночных проверок
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      if (avgValue >= difficulty) {
        resultType = 'success';
      } else {
        resultType = 'fail';
      }
    }
    
    // Проверяем критические успехи/провалы
    const hasCritSuccess = values.some(v => v >= difficulty + 5);
    const hasCritFail = values.some(v => v <= difficulty - 5);
    
    // Для проверок с несколькими барами — критический только если все успешны/провалены
    if (config.bars && config.bars.type === 'multiple') {
      if (hasCritSuccess && (resultType === 'all_success')) {
        resultType = 'crit_success';
      }
      if (hasCritFail && (resultType === 'all_fail')) {
        resultType = 'crit_fail';
      }
    } else {
      // Для одиночных проверок
      if (hasCritSuccess && (resultType === 'success' || resultType === 'all_success' || resultType === 'half_success')) {
        resultType = 'crit_success';
      }
      if (hasCritFail && (resultType === 'fail' || resultType === 'all_fail' || resultType === 'half_fail')) {
        resultType = 'crit_fail';
      }
    }
  }
  
  // Ищем сообщение для результата
  let resultMessage = results[resultType] || getResultLabel(resultType);
  
  // Применяем эффекты
  if (effects && effects[resultType]) {
    const eff = effects[resultType];
    if (eff.arrival) {
      addArrivalBonus(eff.arrival);
    }
    if (eff.events) {
      for (var i = 0; i < eff.events; i++) {
        addBonusEvent();
      }
    }
  }
  
  if (isSecond) {
    event.secondResult = resultType;
    event.secondResultText = resultMessage;
    event.secondChecked = true;
  } else {
    event.result = resultType;
    event.resultText = resultMessage;
    event.checked = true;
  }
  
  renderEvents();
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

export function initPath() {
  if (generateBtn) {
    generateBtn.removeEventListener('click', generatePathEvents);
    generateBtn.addEventListener('click', generatePathEvents);
    console.log('Кнопка "Сгенерировать события" подключена');
  }
}

initPath();
