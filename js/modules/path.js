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
    
    console.log('Загрузка таблицы: ' + tableName);
    
    const { data, error } = await _supabase
      .from(tableName)
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Ошибка загрузки ' + tableName + ':', error);
      return [];
    }
    
    dangerousCreaturesCache[tableName] = data || [];
    console.log('Загружено ' + dangerousCreaturesCache[tableName].length + ' записей из ' + tableName);
    return dangerousCreaturesCache[tableName];
  } catch (err) {
    console.error('Критическая ошибка загрузки ' + tableName + ':', err);
    return [];
  }
}

export function getRandomDangerousCreature(creatures) {
  if (!creatures || creatures.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * creatures.length);
  return creatures[randomIndex];
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
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Ошибка: ' + error.message + '</div>';
      container.style.display = 'block';
      return;
    }
    
    console.log('Получено данных из ' + tableName + ': ' + (data?.length || 0));
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">В таблице "' + tableName + '" нет данных</div>';
      container.style.display = 'block';
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * data.length);
    const item = data[randomIndex];
    
    console.log('Выбрана запись #' + (randomIndex + 1) + ':', item);
    
    let html = '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
    html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат: <strong>' + (randomIndex + 1) + '</strong></div>';
    
    if (item.name) {
      html += '<div style="font-size: 15px; color: #ffffff; font-weight: bold; margin-bottom: 4px;">' + item.name + '</div>';
    }
    
    if (item.description) {
      html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">' + item.description + '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
    
  } catch (err) {
    console.error('Критическая ошибка:', err);
    container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Ошибка: ' + err.message + '</div>';
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

  await loadGreatBeasts();

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

  currentEvents = await generateEventList(common, roleCount);
  renderEvents(currentEvents);
}

async function generateEventList(commonCount, roleCount) {
  const events = [];

  for (var i = 0; i < commonCount; i++) {
    const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
    const eventData = COMMON_EVENTS[roll];
    const eventCopy = createEventCopy(eventData, 'Общее', roll + 1);
    events.push(eventCopy);
  }

  const selectedOption = regionSelect.options[regionSelect.selectedIndex];
  const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
  const dangerousTableName = getDangerousTableName(terrainType);

  for (var j = 0; j < roleCount; j++) {
    const roleIndex = getRandomInt(0, ROLES.length - 1);
    const role = ROLES[roleIndex];
    const roleEvents = ROLE_EVENTS[role] || ROLE_EVENTS['Чтец_Знаков'];
    const roll = getRandomInt(0, roleEvents.length - 1);
    const eventData = roleEvents[roll];
    const eventCopy = createEventCopy(eventData, role, roll + 1);
    
    if (eventData.isGreatBeast) {
      const beast = getRandomGreatBeast();
      if (beast) {
        eventCopy.greatBeast = beast;
      }
    }
    
    if (eventData.isDangerousCreature) {
      const creatures = await loadDangerousCreatures(dangerousTableName);
      const creature = getRandomDangerousCreature(creatures);
      if (creature) {
        eventCopy.dangerousCreature = creature;
        eventCopy.dangerousTableName = dangerousTableName;
      }
    }
    
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
    isCommon: type === 'Общее',
    checked: false,
    result: null,
    secondChecked: false,
    secondResult: null,
    greatBeast: null,
    dangerousCreature: null,
    dangerousTableName: null
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
    // Ссылка на великого зверя
    let greatBeastHTML = '';
    if (event.greatBeast) {
      const beastName = event.greatBeast.name;
      const encodedName = encodeURIComponent(beastName);
      const url = 'bestiary.html?section=great_beasts&beast=' + encodedName;
      greatBeastHTML = '<div style="margin-top: 6px; font-size: 14px; color: #ffd700;">' +
        'Великий зверь: <a href="' + url + '" target="_blank" style="color: #ffd700; text-decoration: underline; cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color=\'#ffffff\'" onmouseout="this.style.color=\'#ffd700\'">' + beastName + '</a>' +
      '</div>';
    }
    
    // Ссылка на опасное существо
    let dangerousCreatureHTML = '';
    if (event.dangerousCreature) {
      const creatureName = event.dangerousCreature.name;
      const encodedName = encodeURIComponent(creatureName);
      const tableName = event.dangerousTableName || 'dangerous_creatures';
      
      let sectionId = 'dangerous_creatures';
      if (tableName === 'Opasnost_pustini') sectionId = 'dangerous_desert';
      else if (tableName === 'Opasnost_stepi') sectionId = 'dangerous_steppes';
      else if (tableName === 'Opasnost_gor') sectionId = 'dangerous_mountains';
      else if (tableName === 'Opasnost_jungle') sectionId = 'dangerous_swamps';
      
      const url = 'bestiary.html?section=' + sectionId + '&beast=' + encodedName;
      dangerousCreatureHTML = '<div style="margin-top: 6px; font-size: 14px; color: #ff6b6b;">' +
        'Опасное существо: <a href="' + url + '" target="_blank" style="color: #ff6b6b; text-decoration: underline; cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color=\'#ffffff\'" onmouseout="this.style.color=\'#ff6b6b\'">' + creatureName + '</a>' +
      '</div>';
    }
    
    // Таблица — пропускаем great_beasts и dangerous_creatures, если есть выбранное существо
    let tableHTML = '';
    if (event.data.hasTable && event.data.tableName && 
        !(event.data.isGreatBeast && event.greatBeast) && 
        !(event.data.isDangerousCreature && event.dangerousCreature)) {
      const tableContainerId = 'table-result-' + index + '-' + Date.now();
      tableHTML = '<div style="margin-top: 8px;">' +
        '<button class="btn-roll-table" data-table="' + event.data.tableName + '" data-container="' + tableContainerId + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px; transition: all 0.3s;">' +
          (event.data.tableIcon || '') + ' Бросить по ' + (event.data.tableLabel || 'таблице') +
        '</button>' +
        '<div id="' + tableContainerId + '" style="display: none; margin-top: 6px;"></div>' +
      '</div>';
    }
    
    let secondCheckHTML = '';
    if (event.data.hasSecondCheck) {
      secondCheckHTML = '<div class="second-check-section">' +
        '<div class="event-check-row">' +
          '<label for="second-check-' + index + '" style="color: rgba(255,215,0,0.6);">Значение проверки (Тень Нарара):</label>' +
          '<input type="number" id="second-check-' + index + '" min="1" max="30" value="10" class="check-input second-check">' +
          '<button class="btn-check-second" data-index="' + index + '">Проверить</button>' +
        '</div>' +
        '<div class="event-result" id="second-result-' + index + '"></div>' +
        '<div class="event-effect" id="second-effect-' + index + '"></div>' +
      '</div>';
    }
    
    return '<div class="event-card" data-index="' + index + '">' +
      '<div class="event-header">' +
        '<span class="event-type">' + event.type + '</span>' +
        '<span class="event-roll">Бросок: <strong>' + event.roll + '</strong></span>' +
      '</div>' +
      '<div class="event-text">' +
        '<strong>' + event.data.title + '</strong><br>' +
        event.data.description +
        (event.data.checkInfo ? '<br><span class="check-info">' + event.data.checkInfo + '</span>' : '') +
        (event.data.secondCheckInfo ? '<br><span class="check-info">' + event.data.secondCheckInfo + '</span>' : '') +
        greatBeastHTML +
        dangerousCreatureHTML +
      '</div>' +
      tableHTML +
      '<div class="event-check-row">' +
        '<label for="check-' + index + '">Значение проверки:</label>' +
        '<input type="number" id="check-' + index + '" min="1" max="30" value="10" class="check-input">' +
        '<button class="btn-check" data-index="' + index + '">Проверить</button>' +
      '</div>' +
      '<div class="event-result" id="result-' + index + '"></div>' +
      '<div class="event-effect" id="effect-' + index + '"></div>' +
      secondCheckHTML +
    '</div>';
  }).join('');

  attachEventHandlers();
}

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================

function attachEventHandlers() {
  eventsContainer.querySelectorAll('.btn-check').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      handleCheck(index, 'main');
    });
  });

  eventsContainer.querySelectorAll('.btn-check-second').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      handleCheck(index, 'second');
    });
  });

  eventsContainer.querySelectorAll('.btn-roll-table').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tableName = this.dataset.table;
      const containerId = this.dataset.container;
      rollTable(tableName, containerId);
    });
  });

  eventsContainer.querySelectorAll('.check-input:not(.second-check)').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const index = parseInt(this.id.split('-')[1]);
        handleCheck(index, 'main');
      }
    });
  });

  eventsContainer.querySelectorAll('.second-check').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const index = parseInt(this.id.split('-')[2]);
        handleCheck(index, 'second');
      }
    });
  });
}

// ============================================================
// ОБРАБОТКА ПРОВЕРКИ
// ============================================================

function handleCheck(index, type) {
  var event = currentEvents[index];
  if (!event) return;

  var isSecond = type === 'second';
  var inputId = isSecond ? 'second-check-' + index : 'check-' + index;
  var resultId = isSecond ? 'second-result-' + index : 'result-' + index;
  var effectId = isSecond ? 'second-effect-' + index : 'effect-' + index;

  var input = document.getElementById(inputId);
  if (!input) {
    console.error('Инпут не найден: ' + inputId);
    return;
  }
  
  var value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение проверки (минимум 1)');
    return;
  }

  var result = getEventResult(value);
  
  if (isSecond) {
    event.secondResult = result;
    event.secondChecked = true;
  } else {
    event.result = result;
    event.checked = true;
  }

  var resultDiv = document.getElementById(resultId);
  var effectDiv = document.getElementById(effectId);

  if (!resultDiv || !effectDiv) return;

  resultDiv.textContent = 'Результат: ' + value + ' — ' + getResultLabel(result);
  resultDiv.className = 'event-result visible ' + getResultClass(result);

  var effects;
  if (isSecond && event.data.secondEffects) {
    effects = event.data.secondEffects;
  } else if (!isSecond && event.data.effects) {
    effects = event.data.effects;
  } else {
    effects = event.data.effects;
  }
  
  if (effects) {
    var effectText = '';
    var effectClass = '';
    
    switch(result) {
      case 'crit_success':
        effectText = effects.crit_success || effects.success || 'Критический успех!';
        effectClass = 'effect-crit';
        break;
      case 'success':
        effectText = effects.success || 'Успех!';
        effectClass = 'effect-success';
        break;
      case 'fail':
        effectText = effects.fail || 'Провал...';
        effectClass = 'effect-fail';
        break;
      case 'crit_fail':
        effectText = effects.crit_fail || effects.fail || 'Критический провал!';
        effectClass = 'effect-fail';
        break;
    }
    
    effectDiv.innerHTML = '<span class="' + effectClass + '">' + effectText + '</span>';
    effectDiv.className = 'event-effect visible';
    
    var diffMatch = effectText.match(/сложность\s*пути\s*([+-])\s*(\d+)/i);
    if (diffMatch) {
      var sign = diffMatch[1] === '+' ? 1 : -1;
      var amount = parseInt(diffMatch[2]);
      addSignMod(sign * amount);
      
      var notif = document.createElement('div');
      notif.style.cssText = 'margin-top: 6px; font-size: 13px; color: #ffd700;';
      notif.textContent = 'Сложность пути изменена: ' + (getBaseDifficulty() + getCurrentSignMod());
      effectDiv.appendChild(notif);
    }
    
    var arrivalRegex = /([+-])\s*(\d+)\s*(?:на\s*|к\s*)?(?:бросок\s*|проверк[ау]\s*)?Прибыти[ею]/i;
    var arrivalMatch = effectText.match(arrivalRegex);
    
    if (arrivalMatch) {
      var sign = arrivalMatch[1] === '+' ? 1 : -1;
      var amount = parseInt(arrivalMatch[2]);
      addArrivalBonus(sign * amount);
      
      var notif = document.createElement('div');
      notif.style.cssText = 'margin-top: 6px; font-size: 13px; color: #51cf66;';
      notif.textContent = 'Бонус кварны изменён: ' + getArrivalBonus();
      effectDiv.appendChild(notif);
    }
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

export function initPath() {
  if (generateBtn) {
    generateBtn.addEventListener('click', generatePathEvents);
    console.log('Кнопка "Сгенерировать события" подключена');
  }
}

initPath();
