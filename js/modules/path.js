// ============================================================
// ФАЗА ПУТЬ
// ============================================================

import { COMMON_EVENTS, ROLES, ROLE_EVENTS } from '../data/events.js';
import { EVENT_TABLES, RUINS_TABLE, OASIS_TABLE } from '../data/tables.js';
import { getRandomInt, getEventResult, getResultLabel, getResultClass, generateRuins, generateOasis } from './utils.js';
import { getRegionId, getCurrentSignMod, addSignMod, updateDifficulty, getBaseDifficulty, setBaseDifficulty } from './region.js';

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

async function getEventTableData(tableName, statsTable = null) {
  try {
    let query = _supabase.from(tableName).select('*');
    const { data, error } = await query;
    
    if (error) {
      console.error(`❌ Ошибка загрузки ${tableName}:`, error);
      return null;
    }
    
    if (statsTable && data.length > 0) {
      const statsIds = data.map(item => item.stats_id).filter(id => id !== null);
      if (statsIds.length > 0) {
        const { data: statsData, error: statsError } = await _supabase
          .from(statsTable)
          .select('*')
          .in('id', statsIds);
        
        if (!statsError && statsData) {
          const statsMap = {};
          statsData.forEach(stat => { statsMap[stat.id] = stat; });
          data.forEach(item => {
            if (item.stats_id && statsMap[item.stats_id]) {
              item.stats = statsMap[item.stats_id];
            }
          });
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return null;
  }
}

function getRandomItem(data) {
  if (!data || data.length === 0) return null;
  const index = Math.floor(Math.random() * data.length);
  return data[index];
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
  if (maxRole > 0) {
    const roll = getRandomInt(1, maxRole);
    roleCount = roll + roleBonus;
  }

  const totalEvents = common + roleCount;

  commonEventsCount.textContent = common;
  maxRoleEvents.textContent = maxRole;
  roleEventsCount.textContent = roleCount;
  totalEventsCount.textContent = totalEvents;

  currentEvents = await generateEventList(common, roleCount);
  renderEvents(currentEvents);
}

async function generateEventList(commonCount, roleCount) {
  const events = [];
  tableCache = {};

  // Общие события
  for (let i = 0; i < commonCount; i++) {
    const roll = getRandomInt(0, COMMON_EVENTS.length - 1);
    const eventData = COMMON_EVENTS[roll];
    const eventCopy = createEventCopy(eventData, 'Общее', roll + 1);
    await enrichEventWithSubRoll(eventCopy);
    events.push(eventCopy);
  }

  // Ролевые события
  for (let i = 0; i < roleCount; i++) {
    const roleIndex = getRandomInt(0, ROLES.length - 1);
    const role = ROLES[roleIndex];
    const roleEvents = ROLE_EVENTS[role] || ROLE_EVENTS['Чтец_Знаков'];
    const roll = getRandomInt(0, roleEvents.length - 1);
    const eventData = roleEvents[roll];
    const eventCopy = createEventCopy(eventData, role, roll + 1);
    await enrichEventWithSubRoll(eventCopy);
    events.push(eventCopy);
  }

  // Перемешиваем
  for (let i = events.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [events[i], events[j]] = [events[j], events[i]];
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
    subRoll: null,
    subRollData: null,
    statsData: null,
    secondChecked: false,
    secondResult: null
  };
}

async function enrichEventWithSubRoll(eventCopy) {
  const eventData = eventCopy.data;
  
  // Добавляем информацию о проверке
  if (eventData.checkInfo) {
    eventCopy.data.description += `<br><span class="check-info">${eventData.checkInfo}</span>`;
  }
  
  // Вторая проверка
  if (eventData.hasSecondCheck && eventData.secondCheckInfo) {
    eventCopy.data.description += `<br><span class="check-info">${eventData.secondCheckInfo}</span>`;
  }
  
  // Под-бросок
  if (eventData.hasSubRoll && eventData.subRollType) {
    const config = EVENT_TABLES[eventData.title];
    const tableName = config?.table;
    const statsTable = config?.statsTable;
    
    // Локальные таблицы
    if (eventData.subRollType === 'ruins') {
      const subData = generateRuins();
      eventCopy.subRollData = subData;
      eventCopy.data.description += `<br><span class="sub-roll">🏛️ ${subData.fullText}</span>`;
      return;
    }
    
    if (eventData.subRollType === 'oasis') {
      const subData = generateOasis();
      eventCopy.subRollData = subData;
      eventCopy.data.description += `<br><span class="sub-roll">🌴 ${subData.fullText}</span>`;
      return;
    }
    
    // Таблицы из Supabase
    if (tableName) {
      if (!tableCache[tableName]) {
        tableCache[tableName] = await getEventTableData(tableName, statsTable);
      }
      
      const subData = tableCache[tableName];
      if (subData && subData.length > 0) {
        const randomItem = getRandomItem(subData);
        eventCopy.subRollData = randomItem;
        if (randomItem.stats) {
          eventCopy.statsData = randomItem.stats;
        }
        
        const fields = config?.fields || ['name'];
        const subText = fields.map(f => randomItem[f] || '').join(' | ');
        
        eventCopy.subRoll = { fullText: subText, data: randomItem };
        
        const icon = eventData.subRollType === 'ruins' ? '🏛️' : 
                    eventData.subRollType === 'oasis' ? '🌴' : '⚔️';
        eventCopy.data.description += `<br><span class="sub-roll">${icon} ${subText}</span>`;
        
        if (randomItem.stats) {
          eventCopy.data.description += `<br><span class="sub-roll" style="border-left-color: #ffd700;">
            📊 <button class="btn-show-stats" data-index="0" style="background: transparent; border: none; color: #ffd700; cursor: pointer; text-decoration: underline; font-family: \'Philosopher\', sans-serif; font-size: 13px;">
              Показать статы существа
            </button>
          </span>`;
        }
      }
    }
  }
}

// ============================================================
// ОТРИСОВКА СОБЫТИЙ
// ============================================================

function renderEvents(events) {
  if (!events || events.length === 0) {
    eventsContainer.innerHTML = '<div class="no-events">Нет событий для этого края</div>';
    return;
  }

  eventsContainer.innerHTML = events.map((event, index) => {
    // Блок для статов
    let statsHTML = '';
    if (event.statsData) {
      const stats = event.statsData;
      statsHTML = `
        <div class="stats-container" id="stats-${index}" style="display: none; margin-top: 10px; padding: 12px 16px; background: rgba(255,215,0,0.05); border-radius: 8px; border: 1px solid rgba(255,215,0,0.2);">
          <div style="color: #ffd700; font-family: 'Calypso', serif; font-size: 16px; margin-bottom: 8px;">📊 Характеристики существа</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; font-size: 14px;">
            ${stats.health ? `<div><span style="color: #888;">❤️ Здоровье:</span> <span style="color: #fff;">${stats.health}</span></div>` : ''}
            ${stats.damage ? `<div><span style="color: #888;">⚔️ Урон:</span> <span style="color: #fff;">${stats.damage}</span></div>` : ''}
            ${stats.armor ? `<div><span style="color: #888;">🛡️ Броня:</span> <span style="color: #fff;">${stats.armor}</span></div>` : ''}
            ${stats.speed ? `<div><span style="color: #888;">💨 Скорость:</span> <span style="color: #fff;">${stats.speed}</span></div>` : ''}
            ${stats.difficulty ? `<div><span style="color: #888;">📈 Сложность:</span> <span style="color: #ffd700;">${stats.difficulty}</span></div>` : ''}
            ${stats.abilities ? `<div style="grid-column: 1/-1;"><span style="color: #888;">🔮 Способности:</span> <span style="color: #fff;">${stats.abilities}</span></div>` : ''}
          </div>
          <button class="btn-hide-stats" data-index="${index}" style="margin-top: 8px; background: transparent; border: 1px solid rgba(255,215,0,0.2); color: #888; border-radius: 4px; padding: 4px 12px; cursor: pointer; font-family: 'Philosopher', sans-serif; font-size: 12px;">Скрыть статы</button>
        </div>
      `;
    }
    
    // Вторая проверка
    let secondCheckHTML = '';
    if (event.data.hasSecondCheck) {
      secondCheckHTML = `
        <div class="second-check-section">
          <div class="event-check-row">
            <label for="second-check-${index}" style="color: rgba(255,215,0,0.6);">Значение проверки (Тень Нарара):</label>
            <input type="number" id="second-check-${index}" min="1" max="30" value="10" class="check-input second-check">
            <button class="btn-check-second" data-index="${index}">Проверить</button>
          </div>
          <div class="event-result" id="second-result-${index}"></div>
          <div class="event-effect" id="second-effect-${index}"></div>
        </div>
      `;
    }
    
    return `
      <div class="event-card" data-index="${index}">
        <div class="event-header">
          <span class="event-type">${event.type}</span>
          <span class="event-roll">Бросок: <strong>${event.roll}</strong></span>
        </div>
        <div class="event-text">
          <strong>${event.data.title}</strong><br>
          ${event.data.description}
        </div>
        ${statsHTML}
        <div class="event-check-row">
          <label for="check-${index}">Значение проверки:</label>
          <input type="number" id="check-${index}" min="1" max="30" value="10" class="check-input">
          <button class="btn-check" data-index="${index}">Проверить</button>
        </div>
        <div class="event-result" id="result-${index}"></div>
        <div class="event-effect" id="effect-${index}"></div>
        ${secondCheckHTML}
      </div>
    `;
  }).join('');

  // Навешиваем обработчики
  attachEventHandlers();
}

// ============================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================

function attachEventHandlers() {
  // Основные проверки
  eventsContainer.querySelectorAll('.btn-check').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      handleCheck(index, 'main');
    });
  });

  // Вторые проверки
  eventsContainer.querySelectorAll('.btn-check-second').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      handleCheck(index, 'second');
    });
  });

  // Показать статы
  eventsContainer.querySelectorAll('.btn-show-stats').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      const statsContainer = document.getElementById(`stats-${index}`);
      if (statsContainer) {
        statsContainer.style.display = 'block';
        this.style.display = 'none';
      }
    });
  });

  // Скрыть статы
  eventsContainer.querySelectorAll('.btn-hide-stats').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      const statsContainer = document.getElementById(`stats-${index}`);
      if (statsContainer) {
        statsContainer.style.display = 'none';
        const showBtn = document.querySelector(`.btn-show-stats[data-index="${index}"]`);
        if (showBtn) showBtn.style.display = 'inline';
      }
    });
  });

  // Enter для основных проверок
  eventsContainer.querySelectorAll('.check-input:not(.second-check)').forEach(input => {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const index = parseInt(this.id.split('-')[1]);
        handleCheck(index, 'main');
      }
    });
  });

  // Enter для вторых проверок
  eventsContainer.querySelectorAll('.second-check').forEach(input => {
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
  const event = currentEvents[index];
  if (!event) return;

  const isSecond = type === 'second';
  const inputId = isSecond ? `second-check-${index}` : `check-${index}`;
  const resultId = isSecond ? `second-result-${index}` : `result-${index}`;
  const effectId = isSecond ? `second-effect-${index}` : `effect-${index}`;

  const input = document.getElementById(inputId);
  if (!input) return;
  
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    alert('Введите корректное значение проверки (минимум 1)');
    return;
  }

  const result = getEventResult(value);
  
  if (isSecond) {
    event.secondResult = result;
    event.secondChecked = true;
  } else {
    event.result = result;
    event.checked = true;
  }

  const resultDiv = document.getElementById(resultId);
  const effectDiv = document.getElementById(effectId);

  resultDiv.textContent = `🎲 Результат: ${value} — ${getResultLabel(result)}`;
  resultDiv.className = `event-result visible ${getResultClass(result)}`;

  // Выбираем эффекты
  let effects;
  if (isSecond && event.data.secondEffects) {
    effects = event.data.secondEffects;
  } else if (!isSecond && event.data.effects) {
    effects = event.data.effects;
  } else {
    effects = event.data.effects;
  }
  
  if (effects) {
    let effectText = '';
    let effectClass = '';
    
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
    
    effectDiv.innerHTML = `<span class="${effectClass}">⚡ ${effectText}</span>`;
    effectDiv.className = 'event-effect visible';
    
    // Проверяем изменение сложности
    const diffMatch = effectText.match(/сложность\s*пути\s*([+-])\s*(\d+)/i);
    if (diffMatch) {
      const sign = diffMatch[1] === '+' ? 1 : -1;
      const amount = parseInt(diffMatch[2]);
      addSignMod(sign * amount);
      
      const notif = document.createElement('div');
      notif.style.cssText = 'margin-top: 6px; font-size: 13px; color: #ffd700;';
      notif.textContent = `🔄 Сложность пути изменена: ${getBaseDifficulty() + getCurrentSignMod()}`;
      effectDiv.appendChild(notif);
    }
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

generateBtn.addEventListener('click', generatePathEvents);
