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
let isRendering = false;

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

async function rollTable(tableName, containerId, fields, isCreature) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Контейнер не найден: ' + containerId);
    return;
  }

  try {
    let actualTableName = tableName;
    
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

  for (var i = 0; i < commonCount; i++) {
    const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
    const eventData = COMMON_EVENTS[roll];
    const eventCopy = createEventCopy(eventData, 'Общее', roll + 1);
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
    const eventCopy = createEventCopy(eventData, role, roll + 1);
    events.push(eventCopy);
  }

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
    resultText: null,
    secondChecked: false,
    secondResult: null,
    secondResultText: null,
    bars: [],
    secondBars: [],
    isBonus: false,
    color: '',
    tableResults: {},
    secondTableResults: {}
  };
}

// ============================================================
// ОТРИСОВКА
// ============================================================

function renderEvents(events) {
  if (isRendering) return;
  isRendering = true;
  
  if (!events || events.length === 0) {
    eventsContainer.innerHTML = '<div class="no-events">Нет событий для этого края</div>';
    isRendering = false;
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
    
    if (config) {
      html += renderEventContent(event, index, config);
    }
    
    if (config && config.check && config.check.bars) {
      html += renderCheckBars(event, index, 'main', config.check);
    }
    
    if (config && config.secondCheck) {
      html += renderSecondCheck(event, index, config.secondCheck);
    }
    
    html += '</div>';
    return html;
  }).join('');

  setTimeout(function() {
    attachEventHandlers();
    isRendering = false;
  }, 50);
}

function renderEventContent(event, index, config) {
  let html = '';
  
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
  
  if (event.checked) {
    const resultType = event.result;
    const resultText = event.resultText || getResultLabel(resultType);
    const resultClass = getResultClass(resultType);
    
    if (resultText) {
      html += '<div class="event-result visible ' + resultClass + '">' + resultText + '</div>';
    }
    
    if (config.check && config.check.results) {
      const results = config.check.results;
      for (var i = 0; i < results.length; i++) {
        const r = results[i];
        let conditionMet = false;
        
        if (r.condition === resultType) {
          conditionMet = true;
        } else if (r.condition === 'all_or_half_success' && (resultType === 'all_success' || resultType === 'half_success' || resultType === 'crit_success')) {
          conditionMet = true;
        } else if (r.condition === 'success' && (resultType === 'success' || resultType === 'crit_success')) {
          conditionMet = true;
        } else if (r.condition === 'fail' && (resultType === 'fail' || resultType === 'crit_fail')) {
          conditionMet = true;
        } else if (r.condition === 'success_5' && resultType === 'crit_success') {
          conditionMet = true;
        } else if (r.condition === 'fail_5' && resultType === 'crit_fail') {
          conditionMet = true;
        } else if (r.condition === 'all_fail' && resultType === 'all_fail') {
          conditionMet = true;
        } else if (r.condition === 'half_fail' && resultType === 'half_fail') {
          conditionMet = true;
        }
        
        if (conditionMet) {
          html += '<div class="event-effect visible">' + r.message + '</div>';
          
          if (r.table) {
            const tableContainerId = 'result-table-' + index + '-' + Date.now();
            const isCreatureTable = r.isCreature || false;
            const fieldsTable = r.fields || ['name'];
            const tableName = r.table;
            const labelTable = r.label || 'Таблица';
            
            html += '<div style="margin-top: 8px;">';
            html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + tableContainerId + '" data-fields="' + fieldsTable.join(',') + '" data-creature="' + isCreatureTable + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
            html += 'Бросить по ' + labelTable;
            html += '</button>';
            html += '<div id="' + tableContainerId + '" style="display: none; margin-top: 6px;"></div>';
            html += '</div>';
          }
          break;
        }
      }
    }
  }
  
  return html;
}

function renderCheckBars(event, index, type, checkConfig) {
  const isSecond = type === 'second';
  const prefix = isSecond ? 'second-' : '';
  const bars = isSecond ? (event.secondBars || []) : (event.bars || []);
  const config = checkConfig || {};
  const barsConfig = config.bars || { type: 'single' };
  
  let html = '<div class="event-check-row">';
  
  if (barsConfig.type === 'single') {
    html += '<label for="' + prefix + 'check-' + index + '">' + (config.label || 'Значение проверки:') + '</label>';
    html += '<input type="number" id="' + prefix + 'check-' + index + '" min="1" max="30" value="10" class="check-input" data-index="' + index + '" data-type="' + type + '">';
    html += '<button class="btn-check' + (isSecond ? '-second' : '') + '" data-index="' + index + '" data-type="' + type + '">Проверить</button>';
  } else if (barsConfig.type === 'multiple') {
    html += '<div style="width:100%;">';
    html += '<label>' + (config.label || 'Значения проверки:') + '</label>';
    
    if (bars.length === 0) {
      bars.push({ value: 10 });
    }
    
    bars.forEach(function(bar, idx) {
      html += '<div style="display:flex; align-items:center; gap:8px; margin-top:6px;">';
      html += '<input type="number" class="check-input bar-input" data-index="' + index + '" data-type="' + type + '" data-bar="' + idx + '" min="1" max="30" value="' + (bar.value || 10) + '" style="width:80px;">';
      if (bars.length > 1) {
        html += '<button class="btn-remove-bar" data-index="' + index + '" data-type="' + type + '" data-bar="' + idx + '" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:16px;">✕</button>';
      }
      html += '</div>';
    });
    
    html += '<button class="btn-add-bar" data-index="' + index + '" data-type="' + type + '" style="margin-top:6px; background:transparent; border:1px solid rgba(255,215,0,0.2); color:#ffd700; padding:2px 12px; border-radius:4px; cursor:pointer; font-size:12px;">+ Добавить результат</button>';
    html += '<button class="btn-check-multiple" data-index="' + index + '" data-type="' + type + '" style="margin-top:6px; margin-left:8px; background:rgba(74,14,14,0.6); color:#fff; border:1px solid #4a0e0e; padding:4px 16px; border-radius:4px; cursor:pointer; font-size:13px;">Проверить все</button>';
    html += '</div>';
  }
  
  html += '</div>';
  
  if (isSecond && event.secondChecked) {
    const resultType = event.secondResult;
    const resultText = event.secondResultText || getResultLabel(resultType);
    const resultClass = getResultClass(resultType);
    if (resultText) {
      html += '<div class="event-result visible ' + resultClass + '" id="second-result-' + index + '">' + resultText + '</div>';
    }
    if (config && config.results) {
      const results = config.results;
      for (var i = 0; i < results.length; i++) {
        const r = results[i];
        let conditionMet = false;
        
        if (r.condition === resultType) {
          conditionMet = true;
        } else if (r.condition === 'success' && (resultType === 'success' || resultType === 'crit_success')) {
          conditionMet = true;
        } else if (r.condition === 'fail' && (resultType === 'fail' || resultType === 'crit_fail')) {
          conditionMet = true;
        } else if (r.condition === 'success_5' && resultType === 'crit_success') {
          conditionMet = true;
        } else if (r.condition === 'fail_5' && resultType === 'crit_fail') {
          conditionMet = true;
        }
        
        if (conditionMet) {
          html += '<div class="event-effect visible">' + r.message + '</div>';
          break;
        }
      }
    }
  }
  
  return html;
}

function renderSecondCheck(event, index, secondConfig) {
  let html = '<div class="second-check-section">';
  
  if (secondConfig.table) {
    const containerId = 'second-table-result-' + index + '-' + Date.now();
    const isCreature = secondConfig.table.isCreature || false;
    const fields = secondConfig.table.fields || ['name'];
    const tableName = secondConfig.table.name;
    const label = secondConfig.table.label || 'Таблица';
    
    html += '<div style="margin-top: 8px;">';
    html += '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-fields="' + fields.join(',') + '" data-creature="' + isCreature + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
    html += 'Бросить по ' + label;
    html += '</button>';
    html += '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>';
    html += '</div>';
  }
  
  html += renderCheckBars(event, index, 'second', secondConfig);
  
  html += '</div>';
  return html;
}

// ============================================================
// ОБРАБОТЧИКИ (делегирование событий)
// ============================================================

function attachEventHandlers() {
  eventsContainer.removeEventListener('click', handleContainerClick);
  eventsContainer.removeEventListener('input', handleContainerInput);
  eventsContainer.removeEventListener('keydown', handleContainerKeydown);
  
  eventsContainer.addEventListener('click', handleContainerClick);
  eventsContainer.addEventListener('input', handleContainerInput);
  eventsContainer.addEventListener('keydown', handleContainerKeydown);
}

function handleContainerClick(e) {
  const target = e.target;
  
  if (target.classList.contains('btn-check') && !target.classList.contains('btn-check-second') && !target.classList.contains('btn-check-multiple')) {
    const index = parseInt(target.dataset.index);
    const type = target.dataset.type || 'main';
    handleSingleCheckClick(index, type);
    return;
  }
  
  if (target.classList.contains('btn-check-second')) {
    const index = parseInt(target.dataset.index);
    handleSingleCheckSecondClick(index);
    return;
  }
  
  if (target.classList.contains('btn-check-multiple')) {
    const index = parseInt(target.dataset.index);
    const type = target.dataset.type || 'main';
    handleMultipleCheckClick(index, type);
    return;
  }
  
  if (target.classList.contains('btn-add-bar')) {
    const index = parseInt(target.dataset.index);
    const type = target.dataset.type || 'main';
    handleAddBarClick(index, type);
    return;
  }
  
  if (target.classList.contains('btn-remove-bar')) {
    const index = parseInt(target.dataset.index);
    const type = target.dataset.type || 'main';
    const barIdx = parseInt(target.dataset.bar);
    handleRemoveBarClick(index, type, barIdx);
    return;
  }
  
  if (target.classList.contains('btn-roll-table')) {
    const tableName = target.dataset.table;
    const containerId = target.dataset.container;
    const fieldsStr = target.dataset.fields || 'name';
    const fields = fieldsStr.split(',');
    const isCreature = target.dataset.creature === 'true';
    rollTable(tableName, containerId, fields, isCreature);
    return;
  }
}

function handleContainerInput(e) {
  const target = e.target;
  if (target.classList.contains('check-input') || target.classList.contains('bar-input')) {
    const index = parseInt(target.dataset.index);
    const type = target.dataset.type || 'main';
    const barIdx = parseInt(target.dataset.bar);
    const event = currentEvents[index];
    if (!event) return;
    
    const isSecond = type === 'second';
    const bars = isSecond ? event.secondBars : event.bars;
    if (bars && !isNaN(barIdx) && bars[barIdx]) {
      bars[barIdx].value = parseInt(target.value) || 10;
    }
  }
}

function handleContainerKeydown(e) {
  if (e.key === 'Enter') {
    const target = e.target;
    if (target.classList.contains('check-input') || target.classList.contains('bar-input')) {
      const btn = target.closest('.event-check-row').querySelector('.btn-check, .btn-check-second, .btn-check-multiple');
      if (btn) btn.click();
    }
  }
}

function handleSingleCheckClick(index, type) {
  const isSecond = type === 'second';
  const prefix = isSecond ? 'second-' : '';
  
  const input = document.getElementById(prefix + 'check-' + index);
  if (!input) {
    console.error('Инпут не найден:', prefix + 'check-' + index);
    return;
  }
  
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение (минимум 1)');
    return;
  }
  
  processCheck(index, type, [value]);
}

function handleSingleCheckSecondClick(index) {
  const input = document.getElementById('second-check-' + index);
  if (!input) {
    console.error('Инпут не найден: second-check-' + index);
    return;
  }
  
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение (минимум 1)');
    return;
  }
  
  processCheck(index, 'second', [value]);
}

function handleMultipleCheckClick(index, type) {
  const inputs = document.querySelectorAll('.bar-input[data-index="' + index + '"][data-type="' + type + '"]');
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
  
  processCheck(index, type, values);
}

function handleAddBarClick(index, type) {
  const event = currentEvents[index];
  if (!event) return;
  
  const isSecond = type === 'second';
  const bars = isSecond ? event.secondBars : event.bars;
  if (!bars) return;
  
  if (bars.length >= 6) {
    alert('Максимум 6 результатов');
    return;
  }
  
  bars.push({ value: 10 });
  renderEvents(currentEvents);
}

function handleRemoveBarClick(index, type, barIdx) {
  const event = currentEvents[index];
  if (!event) return;
  
  const isSecond = type === 'second';
  const bars = isSecond ? event.secondBars : event.bars;
  if (!bars || bars.length <= 1) return;
  
  bars.splice(barIdx, 1);
  renderEvents(currentEvents);
}

// ============================================================
// ОБРАБОТКА ПРОВЕРКИ
// ============================================================

function processCheck(index, type, values) {
  const event = currentEvents[index];
  if (!event) return;
  
  const isSecond = type === 'second';
  const config = isSecond ? event.data.config?.secondCheck : event.data.config?.check;
  if (!config) {
    console.error('Конфиг проверки не найден');
    return;
  }
  
  const difficulty = config.difficulty || 12;
  const results = config.results || [];
  
  const successes = values.filter(v => v >= difficulty).length;
  const failures = values.filter(v => v < difficulty).length;
  const total = values.length;
  const half = Math.ceil(total / 2);
  
  let resultType = '';
  
  if (successes === total) {
    resultType = 'all_success';
  } else if (successes >= half) {
    resultType = 'half_success';
  } else if (failures >= half) {
    resultType = 'half_fail';
  } else if (failures === total) {
    resultType = 'all_fail';
  }
  
  const hasCritSuccess = values.some(v => v >= difficulty + 5);
  const hasCritFail = values.some(v => v <= difficulty - 5);
  
  if (hasCritSuccess && (resultType === 'all_success' || resultType === 'half_success')) {
    resultType = 'crit_success';
  }
  if (hasCritFail && (resultType === 'all_fail' || resultType === 'half_fail')) {
    resultType = 'crit_fail';
  }
  
  if (isSecond) {
    event.secondResult = resultType;
    event.secondResultText = getResultLabel(resultType);
    event.secondChecked = true;
  } else {
    event.result = resultType;
    event.resultText = getResultLabel(resultType);
    event.checked = true;
  }
  
  results.forEach(function(r) {
    let conditionMet = false;
    
    if (r.condition === resultType) {
      conditionMet = true;
    } else if (r.condition === 'all_or_half_success' && (resultType === 'all_success' || resultType === 'half_success' || resultType === 'crit_success')) {
      conditionMet = true;
    } else if (r.condition === 'success' && (resultType === 'success' || resultType === 'crit_success')) {
      conditionMet = true;
    } else if (r.condition === 'fail' && (resultType === 'fail' || resultType === 'crit_fail')) {
      conditionMet = true;
    } else if (r.condition === 'success_5' && resultType === 'crit_success') {
      conditionMet = true;
    } else if (r.condition === 'fail_5' && resultType === 'crit_fail') {
      conditionMet = true;
    } else if (r.condition === 'all_fail' && resultType === 'all_fail') {
      conditionMet = true;
    } else if (r.condition === 'half_fail' && resultType === 'half_fail') {
      conditionMet = true;
    }
    
    if (conditionMet) {
      if (r.effects) {
        if (r.effects.arrival) {
          addArrivalBonus(r.effects.arrival);
          console.log('Прибытие изменено на:', getArrivalBonus());
        }
        if (r.effects.events) {
          for (var i = 0; i < r.effects.events; i++) {
            addBonusEvent();
          }
        }
      }
    }
  });
  
  renderEvents(currentEvents);
}

function addBonusEvent() {
  const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
  const eventData = COMMON_EVENTS[roll];
  const eventCopy = createEventCopy(eventData, 'Общее (бонусное)', roll + 1);
  eventCopy.isBonus = true;
  eventCopy.color = 'rgba(255,215,0,0.08)';
  currentEvents.push(eventCopy);
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
