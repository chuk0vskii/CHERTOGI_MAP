// ============================================================
// ФАЗА ПУТЬ
// ============================================================

import { _supabase } from '../config-module.js';
import { 
  COMMON_EVENTS, ROLES, ROLE_EVENTS, 
  loadGreatBeasts, getRandomGreatBeast, 
  generateEncounter, TABLE_TO_SECTION 
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
// ФУНКЦИЯ ПОЛУЧЕНИЯ РЕГИОНАЛЬНОЙ ТАБЛИЦЫ
// ============================================================

function getRegionalTableName(terrainType) {
  const mapping = {
    'пустыня': 'opasnost_pustini',
    'степи': 'opasnost_stepi',
    'горы': 'opasnost_gor',
    'джунгли': 'opasnost_jungle'
  };
  return mapping[terrainType] || null;
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
// ФУНКЦИЯ РОЛЛА ТАБЛИЦЫ И ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА
// ============================================================

async function rollTableAndDisplay(tableName, containerId, isRegional, isDeadlyEncounter) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Контейнер не найден: ' + containerId);
    return;
  }

  try {
    // Для региональных таблиц — определяем по типу местности
    let actualTableName = tableName;
    if (isRegional) {
      const selectedOption = regionSelect.options[regionSelect.selectedIndex];
      const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
      actualTableName = getRegionalTableName(terrainType);
      if (!actualTableName) {
        container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Не удалось определить региональную таблицу для типа местности: ' + terrainType + '</div>';
        container.style.display = 'block';
        return;
      }
    }

    console.log('Ролл таблицы: ' + actualTableName);
    
    const { data, error } = await _supabase
      .from(actualTableName)
      .select('*');
    
    if (error) {
      console.error('Ошибка запроса к ' + actualTableName + ':', error);
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">Ошибка: ' + error.message + '</div>';
      container.style.display = 'block';
      return;
    }
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">В таблице "' + actualTableName + '" нет данных</div>';
      container.style.display = 'block';
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * data.length);
    const item = data[randomIndex];
    
    console.log('Выбрана запись #' + (randomIndex + 1) + ':', item);

    let html = '<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">';
    html += '<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">Результат: <strong>' + (randomIndex + 1) + '</strong></div>';
    
    if (item.name) {
      const link = createBeastLink(item.name, actualTableName);
      html += '<div style="font-size: 15px; color: #ffffff; font-weight: bold; margin-bottom: 4px;">' + link + '</div>';
    }
    
    if (item.description) {
      html += '<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">' + item.description + '</div>';
    }
    
    // Специальная обработка для Смертельной встречи (результаты 5-8)
    if (isDeadlyEncounter && item.id >= 5 && item.id <= 8) {
      const selectedOption = regionSelect.options[regionSelect.selectedIndex];
      const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
      
      // Генерация 1: Существа зоны
      let zoneHTML = '';
      if (terrainType !== 'неизвестно') {
        const encounter = generateEncounter(terrainType);
        if (encounter) {
          const enc = encounter;
          const entry = enc.entry;
          
          let mainText = entry.text;
          for (var j = 0; j < entry.creatures.length; j++) {
            const c = entry.creatures[j];
            const link = createBeastLink(c.name, c.table);
            mainText = mainText.replace(c.name, link);
          }
          
          let extraLinks = '';
          if (entry.extraCreatures && entry.extraCreatures.length > 0) {
            let extraText = entry.extra;
            for (var k = 0; k < entry.extraCreatures.length; k++) {
              const c = entry.extraCreatures[k];
              const link = createBeastLink(c.name, c.table);
              extraText = extraText.replace(c.name, link);
            }
            extraLinks = ' (' + extraText + ')';
          }
          
          zoneHTML = '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700; font-size: 14px; color: #e0d5c0;">' +
            'Существа зоны (бросок ' + enc.roll + '): ' + mainText + extraLinks +
          '</div>';
        }
      }
      
      // Генерация 2: Дети Вуали
      const veilResult = await _supabase
        .from('veil_children')
        .select('*');
      
      let veilHTML = '';
      if (!veilResult.error && veilResult.data && veilResult.data.length > 0) {
        const veilIndex = Math.floor(Math.random() * veilResult.data.length);
        const veilItem = veilResult.data[veilIndex];
        const link = createBeastLink(veilItem.name, 'veil_children');
        veilHTML = '<div style="margin-top: 4px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ffd700; font-size: 14px; color: #e0d5c0;">' +
          'Дети Вуали: ' + link +
        '</div>';
      }
      
      html += zoneHTML + veilHTML;
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

  for (var j = 0; j < roleCount; j++) {
    const roleIndex = getRandomInt(0, ROLES.length - 1);
    const role = ROLES[roleIndex];
    const roleEvents = ROLE_EVENTS[role] || ROLE_EVENTS['Чтец_Знаков'];
    const roll = getRandomInt(0, roleEvents.length - 1);
    const eventData = roleEvents[roll];
    const eventCopy = createEventCopy(eventData, role, roll + 1);
    
    // Для великих зверей — сразу генерируем
    if (eventData.tables && eventData.tables.some(t => t.isGreatBeast)) {
      const beast = getRandomGreatBeast();
      if (beast) {
        eventCopy.greatBeast = beast;
      }
    }
    
    // Для региональных встреч — сразу генерируем
    if (eventData.tables && eventData.tables.some(t => t.isRegional) && terrainType !== 'неизвестно') {
      const encounter = generateEncounter(terrainType);
      if (encounter) {
        eventCopy.encounter = encounter;
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
    encounter: null,
    tableResults: {},
    secondTableResults: {}
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
      const link = createBeastLink(beastName, 'great_beasts');
      greatBeastHTML = '<div style="margin-top: 6px; font-size: 14px; color: #ffd700;">Великий зверь: ' + link + '</div>';
    }
    
    // Встреча по типу местности
    let encounterHTML = '';
    if (event.encounter) {
      const enc = event.encounter;
      const entry = enc.entry;
      
      let mainText = entry.text;
      for (var j = 0; j < entry.creatures.length; j++) {
        const c = entry.creatures[j];
        const link = createBeastLink(c.name, c.table);
        mainText = mainText.replace(c.name, link);
      }
      
      let extraLinks = '';
      if (entry.extraCreatures && entry.extraCreatures.length > 0) {
        let extraText = entry.extra;
        for (var k = 0; k < entry.extraCreatures.length; k++) {
          const c = entry.extraCreatures[k];
          const link = createBeastLink(c.name, c.table);
          extraText = extraText.replace(c.name, link);
        }
        extraLinks = ' (' + extraText + ')';
      }
      
      encounterHTML = '<div style="margin-top: 6px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ff6b6b; font-size: 14px; color: #e0d5c0;">' +
        'Встреча (бросок ' + enc.roll + '): ' + mainText + extraLinks +
      '</div>';
    }
    
    // Кнопки для таблиц (появляются после проверки)
    let tableButtonsHTML = '';
    if (event.checked && event.data.tables) {
      const tables = event.data.tables.filter(t => {
        if (t.trigger === 'always') return true;
        if (t.trigger === 'fail' && (event.result === 'fail' || event.result === 'crit_fail')) return true;
        if (t.trigger === 'fail_5' && event.result === 'crit_fail') return true;
        if (t.trigger === 'success' && (event.result === 'success' || event.result === 'crit_success')) return true;
        if (t.trigger === 'crit_success' && event.result === 'crit_success') return true;
        return false;
      });
      
      tables.forEach(function(table, idx) {
        const containerId = 'table-result-' + index + '-' + idx + '-' + Date.now();
        const isRegional = table.isRegional || false;
        const isDeadlyEncounter = table.isDeadlyEncounter || false;
        const tableName = table.tableName || 'opasnost_pustini';
        
        tableButtonsHTML += '<div style="margin-top: 8px;">' +
          '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-regional="' + isRegional + '" data-deadly="' + isDeadlyEncounter + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px; transition: all 0.3s;">' +
            'Бросить по ' + table.name +
          '</button>' +
          '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>' +
        '</div>';
      });
    }
    
    // Вторые проверки (для Древних Руин)
    let secondTableButtonsHTML = '';
    if (event.secondChecked && event.data.secondTables) {
      const secondTables = event.data.secondTables.filter(t => {
        if (t.trigger === 'always') return true;
        if (t.trigger === 'fail' && (event.secondResult === 'fail' || event.secondResult === 'crit_fail')) return true;
        if (t.trigger === 'fail_5' && event.secondResult === 'crit_fail') return true;
        if (t.trigger === 'success' && (event.secondResult === 'success' || event.secondResult === 'crit_success')) return true;
        return false;
      });
      
      secondTables.forEach(function(table, idx) {
        const containerId = 'second-table-result-' + index + '-' + idx + '-' + Date.now();
        const isRegional = table.isRegional || false;
        const tableName = table.tableName || 'opasnost_pustini';
        
        secondTableButtonsHTML += '<div style="margin-top: 8px;">' +
          '<button class="btn-roll-table" data-table="' + tableName + '" data-container="' + containerId + '" data-regional="' + isRegional + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px; transition: all 0.3s;">' +
            'Бросить по ' + table.name +
          '</button>' +
          '<div id="' + containerId + '" style="display: none; margin-top: 6px;"></div>' +
        '</div>';
      });
    }
    
    let secondCheckHTML = '';
    if (event.data.hasSecondCheck || event.data.secondCheckInfo) {
      secondCheckHTML = '<div class="second-check-section">' +
        '<div class="event-check-row">' +
          '<label for="second-check-' + index + '" style="color: rgba(255,215,0,0.6);">Значение проверки (Тень Нарара):</label>' +
          '<input type="number" id="second-check-' + index + '" min="1" max="30" value="10" class="check-input second-check">' +
          '<button class="btn-check-second" data-index="' + index + '">Проверить</button>' +
        '</div>' +
        '<div class="event-result" id="second-result-' + index + '"></div>' +
        '<div class="event-effect" id="second-effect-' + index + '"></div>' +
        secondTableButtonsHTML +
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
        encounterHTML +
      '</div>' +
      tableButtonsHTML +
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
      const isRegional = this.dataset.regional === 'true';
      const isDeadly = this.dataset.deadly === 'true';
      rollTableAndDisplay(tableName, containerId, isRegional, isDeadly);
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
    
    // Генерация встречи при провале для событий с needsZoneCreatures
    if (effects && effects.needsZoneCreatures && (result === 'fail' || result === 'crit_fail')) {
      const selectedOption = regionSelect.options[regionSelect.selectedIndex];
      const terrainType = selectedOption?.dataset?.terrainType || 'неизвестно';
      
      if (terrainType !== 'неизвестно') {
        const encounter = generateEncounter(terrainType);
        if (encounter) {
          event.encounter = encounter;
          
          const enc = encounter;
          const entry = enc.entry;
          
          let mainText = entry.text;
          for (var j = 0; j < entry.creatures.length; j++) {
            const c = entry.creatures[j];
            const link = createBeastLink(c.name, c.table);
            mainText = mainText.replace(c.name, link);
          }
          
          let extraLinks = '';
          if (entry.extraCreatures && entry.extraCreatures.length > 0) {
            let extraText = entry.extra;
            for (var k = 0; k < entry.extraCreatures.length; k++) {
              const c = entry.extraCreatures[k];
              const link = createBeastLink(c.name, c.table);
              extraText = extraText.replace(c.name, link);
            }
            extraLinks = ' (' + extraText + ')';
          }
          
          var encounterHTML = '<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.05); border-radius: 6px; border-left: 2px solid #ff6b6b; font-size: 14px; color: #e0d5c0;">' +
            'Встреча (бросок ' + enc.roll + '): ' + mainText + extraLinks +
          '</div>';
          
          effectDiv.innerHTML += encounterHTML;
        }
      }
    }
  }
  
  // Перерендериваем событие, чтобы показать кнопки таблиц
  renderEvents(currentEvents);
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
