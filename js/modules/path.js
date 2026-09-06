// ============================================================
// ФАЗА ПУТЬ - ДИСПЕТЧЕР
// ============================================================

import { _supabase } from '../config-module.js';
import { 
  COMMON_EVENTS_MODULES, READER_EVENTS_MODULES, SHADOW_EVENTS_MODULES,
  TABLE_TO_SECTION, getRegionalTableName, getEventModule
} from '../events/index.js';
import { getRandomInt, getResultLabel, getResultClass } from './utils.js';
import { 
  addArrivalBonus, getArrivalBonus, 
  getCurrentDifficulty, getBaseDifficulty, getCurrentSignMod,
  addSignMod, updateDifficulty
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
// РОЛЛ ТАБЛИЦЫ С СОХРАНЕНИЕМ РЕЗУЛЬТАТА
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
    
    // Определяем количество результатов (по умолчанию 1)
    const resultsCount = count || 1;
    let html = '';
    const results = [];
    
    for (var i = 0; i < resultsCount; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const item = data[randomIndex];
      results.push({ item, randomIndex });
      
      html += '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
      html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат #' + (i + 1) + ': <strong>' + (randomIndex + 1) + '</strong></div>';
      
      fields.forEach(function(field) {
        if (item[field] !== undefined && item[field] !== null) {
          let value = item[field];
          if (isCreature) value = createBeastLink(value, actualTableName);
          const label = field === 'name' ? '' : 
                        field === 'pass_method' ? 'Как пройти: ' : 
                        field === 'reward_type' ? 'Что хранят: ' : 
                        field === 'oasis_type' ? 'Оазис: ' : 
                        field === 'mystery' ? 'Тайна: ' : '';
          html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">' + label + value + '</div>';
        }
      });
      html += '</div>';
    }
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    // Сохраняем результат в событие
    const event = findEventById(eventId);
    if (event) {
      if (!event.tableResults) event.tableResults = {};
      event.tableResults[resultKey] = { 
        html: html, 
        results: results,
        count: resultsCount
      };
    }
    
  } catch (err) {
    console.error('Ошибка:', err);
    container.innerHTML = '<div style="color: #ff6b6b;">Ошибка</div>';
    container.style.display = 'block';
  }
}

// ============================================================
// ГЕНЕРАЦИЯ СПИСКА СОБЫТИЙ
// ============================================================

function getEventListByType(type) {
  if (type === 'Общее') {
    return Object.values(COMMON_EVENTS_MODULES);
  }
  if (type === 'Чтец_Знаков') {
    return Object.values(READER_EVENTS_MODULES);
  }
  if (type === 'Тень_Нарара') {
    return Object.values(SHADOW_EVENTS_MODULES);
  }
  return Object.values(COMMON_EVENTS_MODULES);
}

function getRandomEvent(type) {
  const list = getEventListByType(type);
  const randomIndex = getRandomInt(0, list.length - 1);
  return list[randomIndex];
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

  commonEventsCount.textContent = common;
  maxRoleEvents.textContent = maxRole;
  roleEventsCount.textContent = roleDisplay;
  totalEventsCount.textContent = common + roleCount;

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
    e.module = e.eventModule;
  });
  
  currentEvents = events;
  renderEvents();
}

function generateEventList(commonCount, roleCount) {
  const events = [];

  for (var i = 0; i < commonCount; i++) {
    const module = getRandomEvent('Общее');
    const eventCopy = { 
      data: { id: module.id }, 
      type: 'Общее', 
      roll: getRandomInt(1, 6), 
      isBonus: false,
      eventModule: module
    };
    events.push(eventCopy);
  }

  const roles = ['Чтец_Знаков', 'Тень_Нарара'];
  for (var j = 0; j < roleCount; j++) {
    const roleIndex = getRandomInt(0, roles.length - 1);
    const role = roles[roleIndex];
    const module = getRandomEvent(role);
    const eventCopy = { 
      data: { id: module.id }, 
      type: role, 
      roll: getRandomInt(1, 6), 
      isBonus: false,
      eventModule: module
    };
    events.push(eventCopy);
  }

  for (var k = events.length - 1; k > 0; k--) {
    const j2 = Math.floor(Math.random() * (k + 1));
    [events[k], events[j2]] = [events[j2], events[k]];
  }

  return events;
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
    const module = event.module;
    const bgColor = event.isBonus ? 'rgba(255,215,0,0.08)' : '';
    const borderColor = event.isBonus ? '2px solid rgba(255,215,0,0.3)' : '1px solid rgba(74,14,14,0.2)';
    
    html += '<div class="event-card" data-id="' + event.id + '" style="background: ' + bgColor + '; border: ' + borderColor + ';">';
    html += '<div class="event-header">';
    html += '<span class="event-type">' + (event.isBonus ? '⭐ ' : '') + event.type + '</span>';
    html += '<span class="event-roll">Бросок: <strong>' + event.roll + '</strong></span>';
    html += '</div>';
    html += '<div class="event-text">';
    html += '<strong>' + (module ? module.title : 'Событие #' + event.data.id) + '</strong><br>';
    html += (module ? module.description : '');
    if (module && module.checkInfo) {
      html += '<br><span class="check-info">' + module.checkInfo + '</span>';
    }
    html += '</div>';
    
    if (module && module.render) {
      const helpers = {
        createTableButton: function(tableName, eventId, resultKey, ev, count) {
          const moduleTables = module.tables || {};
          const tableConfig = moduleTables[tableName];
          if (!tableConfig) return '';
          
          const containerId = 'table-result-' + eventId + '-' + tableName + '-' + (count || 1);
          const fields = tableConfig.fields || ['name'];
          const isCreature = tableConfig.isCreature || false;
          const label = tableConfig.label || 'Таблица';
          const resultsCount = count || 1;
          
          let h = '<div style="margin-top: 8px;">';
          h += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" data-event-id="' + eventId + '" data-result-key="' + resultKey + '" data-count="' + resultsCount + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
          h += 'Бросить по ' + label + (resultsCount > 1 ? ' (' + resultsCount + ' раза)' : '');
          h += '</button>';
          if (ev && ev.tableResults && ev.tableResults[resultKey]) {
            h += '<div id="' + containerId + '" style="display: block; margin-top: 6px;">' + ev.tableResults[resultKey].html + '</div>';
          } else {
            h += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
          }
          h += '</div>';
          return h;
        },
        createMultipleBars: function(ev, type, label, difficulty) {
          const isSecond = type === 'second';
          const prefix = isSecond ? 'second-' : '';
          const bars = isSecond ? (ev.secondBars || []) : (ev.bars || []);
          const eventId = ev.id;
          
          let h = '<div class="event-check-row">';
          h += '<div style="width:100%;">';
          h += '<label>' + (label || 'Значения проверки:') + '</label>';
          
          if (bars.length === 0) bars.push({ value: 10 });
          
          bars.forEach(function(bar, idx) {
            h += '<div style="display:flex; align-items:center; gap:8px; margin-top:6px;">';
            h += '<input type="number" class="check-input bar-input" data-event-id="' + eventId + '" data-type="' + type + '" data-bar="' + idx + '" min="1" max="30" value="' + (bar.value || 10) + '" style="width:80px;">';
            if (bars.length > 1) {
              h += '<button class="btn-remove-bar" data-event-id="' + eventId + '" data-type="' + type + '" data-bar="' + idx + '" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:16px;">✕</button>';
            }
            h += '</div>';
          });
          
          h += '<button class="btn-add-bar" data-event-id="' + eventId + '" data-type="' + type + '" style="margin-top:6px; background:transparent; border:1px solid rgba(255,215,0,0.2); color:#ffd700; padding:2px 12px; border-radius:4px; cursor:pointer; font-size:12px;">+ Добавить результат</button>';
          h += '<button class="btn-check-multiple" data-event-id="' + eventId + '" data-type="' + type + '" style="margin-top:6px; margin-left:8px; background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:4px 16px; border-radius:4px; cursor:pointer; font-size:13px;">Проверить все</button>';
          h += '</div>';
          h += '</div>';
          return h;
        },
        createSingleBar: function(ev, type, label, difficulty) {
          const isSecond = type === 'second';
          const prefix = isSecond ? 'second-' : '';
          const eventId = ev.id;
          
          let h = '<div class="event-check-row">';
          h += '<label for="' + prefix + 'check-' + eventId + '">' + (label || 'Значение проверки:') + '</label>';
          h += '<input type="number" id="' + prefix + 'check-' + eventId + '" min="1" max="30" value="10" class="check-input" data-event-id="' + eventId + '" data-type="' + type + '">';
          h += '<button class="btn-check' + (isSecond ? '-second' : '') + '" data-event-id="' + eventId + '" data-type="' + type + '">Проверить</button>';
          h += '</div>';
          return h;
        },
        createResult: function(resultType, resultText) {
          if (!resultText) return '';
          const resultClass = getResultClass(resultType);
          return '<div class="event-result visible ' + resultClass + '">' + resultText + '</div>';
        },
        createEffect: function(resultType, effects) {
          if (!effects || !effects[resultType]) return '';
          return '<div class="event-effect visible">' + effects[resultType] + '</div>';
        },
        getCurrentDifficulty: function() {
          return getCurrentDifficulty();
        }
      };
      
      html += module.render(event, helpers);
    }
    
    html += '</div>';
  });
  
  eventsContainer.innerHTML = html;
  attachEventHandlers();
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
    const count = parseInt(target.dataset.count) || 1;
    rollTableInternal(tableName, containerId, fields, isCreature, eventId, resultKey, count);
    return;
  }
  
  if (target.classList.contains('btn-reality-tear')) {
    const eventId = parseInt(target.dataset.eventId);
    handleRealityTear(eventId);
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
// ОБРАБОТКА ПРОВЕРОК
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
// ОБРАБОТКА ПРОВЕРКИ (ВЫЗОВ МОДУЛЯ)
// ============================================================

function processCheck(eventId, type, values) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const module = event.module;
  if (!module || !module.handleCheck) {
    console.error('Модуль события не найден или нет handleCheck', eventId);
    return;
  }
  
  // Получаем текущую сложность
  const difficulty = getCurrentDifficulty();
  
  // Передаём сложность в модуль
  const result = module.handleCheck(event, values, type, difficulty);
  
  if (!result) {
    return;
  }
  
  const isSecond = type === 'second';
  
  if (isSecond) {
    event.secondResult = result.resultType;
    event.secondResultText = result.resultText;
    event.secondChecked = true;
  } else {
    event.result = result.resultType;
    event.resultText = result.resultText;
    event.checked = true;
  }
  
  // Применяем эффекты из модуля
  if (result.effects) {
    if (result.effects.arrival) {
      addArrivalBonus(result.effects.arrival);
    }
    if (result.effects.signMod) {
      addSignMod(result.effects.signMod);
    }
  }
  
  renderEvents();
}

// ============================================================
// ОБРАБОТКА ПРОЛОМА РЕАЛЬНОСТИ
// ============================================================

function handleRealityTear(eventId) {
  const event = findEventById(eventId);
  if (!event) return;
  
  const roll = getRandomInt(1, 8);
  const results = {
    1: 'Прорыв грани Вуали',
    2: 'Прорыв грани Вуали',
    3: 'Разлом в лабиринты',
    4: 'Разлом в лабиринты',
    5: 'Открытие кармана мира духов',
    6: 'Открытие кармана мира духов',
    7: 'Дыхание дальних чертогов',
    8: 'Дыхание дальних чертогов'
  };
  
  const resultText = results[roll] || 'Неизвестная природа пролома';
  
  const container = document.getElementById('reality-result-' + eventId);
  if (container) {
    container.innerHTML = '<div style="background: rgba(255,215,0,0.05); padding: 8px 12px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 4px;">Результат (1d8): <strong>' + roll + '</strong> — ' + resultText + '</div>';
    container.style.display = 'block';
  }
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
