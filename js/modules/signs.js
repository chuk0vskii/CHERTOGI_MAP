// ============================================================
// ФАЗА ЗНАКИ
// ============================================================

import { SIGNS } from '../data/signs.js';
import { 
  getRegionId, addSignMod, resetSignMod, updateDifficulty, 
  addArrivalBonus, resetArrivalBonus,
  addExtraEvents, resetExtraEvents,
  addLuckDice, resetLuckDice,
  addCurseDice, resetCurseDice
} from './region.js';

const signInput = document.getElementById('signInput');
const signResult = document.getElementById('signResult');
const signPlaceholder = document.getElementById('signPlaceholder');
const signTitle = document.getElementById('signTitle');
const signDescription = document.getElementById('signDescription');
const signMeta = document.getElementById('signMeta');
const signImage = document.getElementById('signImage');

const eyeInput = document.getElementById('eyeInput');

let currentSign = null; 
let currentModApplied = 0; 
let currentArrivalApplied = 0; 
let currentEventApplied = 0;
let currentLuckApplied = 0;
let currentCurseApplied = 0;

// ============================================================
// БРОСОК ЗНАКА
// ============================================================

export function drawSign() {
  const regionId = getRegionId();
  console.log('🎯 drawSign вызван, regionId:', regionId);
  
  if (regionId === null || regionId === undefined) {
    alert('Сначала выберите край!');
    return;
  }

  const value = parseInt(signInput.value);
  if (isNaN(value) || value < 1) {
    alert('Введите число проверки (минимум 1)');
    return;
  }

  let index = value;
  if (index > 20) index = 20;

  const sign = SIGNS[index];
  if (!sign) {
    alert('Знак не найден. Попробуйте другое число.');
    return;
  }

  if (currentSign) {
    addSignMod(-currentModApplied);
    addArrivalBonus(-currentArrivalApplied);
    addExtraEvents(-currentEventApplied);
    addLuckDice(-currentLuckApplied);
    addCurseDice(-currentCurseApplied);
  }

  currentSign = sign;
  currentModApplied = sign.mod || 0;
  currentArrivalApplied = sign.arrivalBonus || 0;
  currentEventApplied = sign.extraEvents || 0;
  currentLuckApplied = sign.luckDice || 0;
  currentCurseApplied = sign.curseDice || 0;

  addSignMod(currentModApplied);
  
  if (currentArrivalApplied) addArrivalBonus(currentArrivalApplied);
  if (currentEventApplied) addExtraEvents(currentEventApplied);
  if (currentLuckApplied) addLuckDice(currentLuckApplied);
  if (currentCurseApplied) addCurseDice(currentCurseApplied);

  signTitle.textContent = sign.title;
  signDescription.textContent = sign.description;

  updateSignUI(sign, false); 
  signResult.classList.add('visible');
  signPlaceholder.style.display = 'none';
}

// ============================================================
// ПРОВЕРКА ОКА ПРЕДЗНАМЕНОВАНИЯ
// ============================================================

export function checkEye() {
  if (!currentSign) {
    alert('Сначала узнайте знак!');
    return;
  }

  const eyeValue = parseInt(eyeInput.value);
  if (isNaN(eyeValue) || eyeValue < 1) {
    alert('Введите число проверки Ока Предзнаменования');
    return;
  }

  if (!currentSign.isNumeric) {
    alert('Этот знак не имеет числовых эффектов, которые можно изменить.');
    return;
  }

  const dc = currentSign.dc || 15;
  const isSuccess = eyeValue >= dc;

  // Откатываем предыдущие бонусы
  addSignMod(-currentModApplied);
  addArrivalBonus(-currentArrivalApplied);
  addExtraEvents(-currentEventApplied);
  addLuckDice(-currentLuckApplied);
  addCurseDice(-currentCurseApplied);

  let newMod = 0;
  let newArrival = 0;
  let newEvents = 0;
  let newLuck = 0;
  let newCurse = 0;

  // Расчет для Сложности (mod)
  if (currentSign.mod !== undefined && currentSign.mod !== 0) {
    const isBad = currentSign.mod > 0; 
    if (isBad) {
      newMod = isSuccess ? (currentSign.mod * -1) : (currentSign.mod * 2);
    } else {
      newMod = isSuccess ? (currentSign.mod * 2) : (currentSign.mod * -1);
    }
  }

  // Расчет для Прибытия (arrivalBonus)
  if (currentSign.arrivalBonus !== undefined && currentSign.arrivalBonus !== 0) {
    const isBad = currentSign.arrivalBonus < 0; 
    if (isBad) {
      newArrival = isSuccess ? (currentSign.arrivalBonus * -1) : (currentSign.arrivalBonus * 2);
    } else {
      newArrival = isSuccess ? (currentSign.arrivalBonus * 2) : (currentSign.arrivalBonus * -1);
    }
  }

  // Расчет для Событий (extraEvents)
  // В базе: positiveEvents = true (например, +1 событие), negativeEvents = false (например, -1 событие)
  if (currentSign.extraEvents !== undefined && currentSign.extraEvents !== 0) {
    const isBad = currentSign.extraEvents > 0; // +1 событие - это плохо
    if (isBad) {
      newEvents = isSuccess ? (currentSign.extraEvents * -1) : (currentSign.extraEvents * 2);
    } else {
      newEvents = isSuccess ? (currentSign.extraEvents * 2) : (currentSign.extraEvents * -1);
    }
  }

  // Расчет для Костей Удачи (luckDice) и Проклятья (curseDice)
  // Если знак дает кости удачи (luckDice > 0), при провале они превращаются в кости проклятья.
  if (currentSign.luckDice !== undefined && currentSign.luckDice > 0) {
    if (isSuccess) {
      newLuck = currentSign.luckDice * 2;
    } else {
      newCurse = currentSign.luckDice;
    }
  }

  currentModApplied = newMod;
  currentArrivalApplied = newArrival;
  currentEventApplied = newEvents;
  currentLuckApplied = newLuck;
  currentCurseApplied = newCurse;

  addSignMod(newMod);
  addArrivalBonus(newArrival);
  addExtraEvents(newEvents);
  addLuckDice(newLuck);
  addCurseDice(newCurse);

  updateSignUI(currentSign, true, isSuccess, newMod, newArrival, newEvents, newLuck, newCurse);
}

// ============================================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ЗНАКА
// ============================================================

function updateSignUI(sign, isChecked, isSuccess, modValue, arrivalValue, eventValue, luckValue, curseValue) {
  let metaHtml = 'Выпало: <strong>' + sign.title + '</strong>';
  
  if (!isChecked) {
    if (sign.mod !== 0) {
      const modClass = sign.mod > 0 ? 'mod-positive' : 'mod-negative';
      const modText = sign.mod > 0 ? '+' + sign.mod : '' + sign.mod;
      metaHtml += ' | Сложность: <strong class="' + modClass + '">' + modText + '</strong>';
    }
    if (sign.arrivalBonus) {
      const arrClass = sign.arrivalBonus > 0 ? 'mod-negative' : 'mod-positive';
      metaHtml += ' | Прибытие: <strong class="' + arrClass + '">' + (sign.arrivalBonus > 0 ? '+' + sign.arrivalBonus : sign.arrivalBonus) + '</strong>';
    }
    if (sign.extraEvents) {
      const evClass = sign.extraEvents > 0 ? 'mod-positive' : 'mod-negative';
      metaHtml += ' | События: <strong class="' + evClass + '">' + (sign.extraEvents > 0 ? '+' + sign.extraEvents : sign.extraEvents) + '</strong>';
    }
    if (sign.luckDice) {
      metaHtml += ' | Кости удачи: <strong class="mod-negative">+' + sign.luckDice + '</strong>';
    }
  }

  if (isChecked) {
    const resultText = isSuccess ? 'Успех!' : 'Провал...';
    const resultColor = isSuccess ? '#51cf66' : '#ff6b6b';
    metaHtml += '<br><span style="color: ' + resultColor + '; font-weight: bold;">Око Предзнаменования: ' + resultText + '</span>';
    
    if (modValue !== 0) {
      const modClass = modValue > 0 ? 'mod-positive' : 'mod-negative';
      metaHtml += ' | Сложность: <strong class="' + modClass + '">' + (modValue > 0 ? '+' + modValue : modValue) + '</strong>';
    }
    if (arrivalValue !== 0) {
      const arrClass = arrivalValue > 0 ? 'mod-negative' : 'mod-positive';
      metaHtml += ' | Прибытие: <strong class="' + arrClass + '">' + (arrivalValue > 0 ? '+' + arrivalValue : arrivalValue) + '</strong>';
    }
    if (eventValue !== 0) {
      const evClass = eventValue > 0 ? 'mod-positive' : 'mod-negative';
      metaHtml += ' | События: <strong class="' + evClass + '">' + (eventValue > 0 ? '+' + eventValue : eventValue) + '</strong>';
    }
    if (luckValue > 0) {
      metaHtml += ' | Кости удачи: <strong class="mod-negative">+' + luckValue + '</strong>';
    }
    if (curseValue > 0) {
      metaHtml += ' | Кости проклятья (Хранителю): <strong class="mod-positive">+' + curseValue + '</strong>';
    }
  }

  if (sign.effect) {
    metaHtml += '<br><span style="font-size:13px; color:rgba(255,255,255,0.6);">' + sign.effect + '</span>';
  }
  
  signMeta.innerHTML = metaHtml;

  if (sign.image) {
    signImage.innerHTML = '<img src="/CHERTOGI_MAP/znakiimg/' + sign.image + '" alt="' + sign.title + '" style="width:100%; height:100%; object-fit:cover;">';
    signImage.style.background = 'transparent';
    signImage.style.display = 'flex';
    signImage.style.alignItems = 'center';
    signImage.style.justifyContent = 'center';
  } else {
    signImage.innerHTML = '500×500<br>заглушка';
    signImage.style.background = '#4a0e0e';
    signImage.style.display = 'flex';
    signImage.style.alignItems = 'center';
    signImage.style.justifyContent = 'center';
    signImage.style.color = 'rgba(255,255,255,0.2)';
    signImage.style.fontSize = '14px';
    signImage.style.textAlign = 'center';
  }
}

// ============================================================
// СБРОС
// ============================================================

export function resetSigns() {
  const regionId = getRegionId();
  if (regionId === null || regionId === undefined) {
    alert('Сначала выберите край');
    return;
  }
  
  if (currentSign) {
    addSignMod(-currentModApplied);
    addArrivalBonus(-currentArrivalApplied);
    addExtraEvents(-currentEventApplied);
    addLuckDice(-currentLuckApplied);
    addCurseDice(-currentCurseApplied);
  }
  
  currentSign = null;
  currentModApplied = 0;
  currentArrivalApplied = 0;
  currentEventApplied = 0;
  currentLuckApplied = 0;
  currentCurseApplied = 0;

  resetSignMod();
  resetArrivalBonus();
  resetExtraEvents();
  resetLuckDice();
  resetCurseDice();
  updateDifficulty();
  
  signResult.classList.remove('visible');
  signPlaceholder.style.display = 'block';
  
  signMeta.innerHTML = '<span style="color:#51cf66;">✅ Эффекты всех знаков сброшены</span>';
  signResult.classList.add('visible');
  signPlaceholder.style.display = 'none';
  
  setTimeout(function() {
    signResult.classList.remove('visible');
    signPlaceholder.style.display = 'block';
  }, 2000);
}
