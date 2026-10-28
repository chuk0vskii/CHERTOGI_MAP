// ============================================================
// ФАЗА ЗНАКИ
// ============================================================

import { SIGNS } from '../data/signs.js';
import { 
  getRegionId, addSignMod, resetSignMod, updateDifficulty, 
  addArrivalBonus, resetArrivalBonus 
} from './region.js';

const signInput = document.getElementById('signInput');
const signResult = document.getElementById('signResult');
const signPlaceholder = document.getElementById('signPlaceholder');
const signTitle = document.getElementById('signTitle');
const signDescription = document.getElementById('signDescription');
const signMeta = document.getElementById('signMeta');
const signImage = document.getElementById('signImage');

// Новые элементы для проверки Ока
const eyeInput = document.getElementById('eyeInput');
const eyeCheckBtn = document.getElementById('eyeCheckBtn');

let currentSign = null; // Храним текущий выпавший знак
let currentModApplied = 0; // Сколько было применено к сложности
let currentArrivalApplied = 0; // Сколько было применено к прибытию

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

  // Сбрасываем предыдущий знак перед новым броском
  if (currentSign) {
    addSignMod(-currentModApplied);
    addArrivalBonus(-currentArrivalApplied);
  }

  currentSign = sign;
  currentModApplied = sign.mod || 0;
  currentArrivalApplied = sign.arrivalBonus || 0;

  addSignMod(currentModApplied);
  
  if (currentArrivalApplied) {
    addArrivalBonus(currentArrivalApplied);
  }

  signTitle.textContent = sign.title;
  signDescription.textContent = sign.description;

  updateSignUI(sign, false); // false = проверка еще не пройдена
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

  // Проверяем, есть ли числовой эффект
  if (!currentSign.isNumeric) {
    alert('Этот знак не имеет числовых эффектов, которые можно изменить.');
    return;
  }

  const dc = currentSign.dc || 15;
  const isSuccess = eyeValue >= dc;
  const isPositive = currentSign.type === 'positive';

  // Откатываем предыдущие бонусы
  addSignMod(-currentModApplied);
  addArrivalBonus(-currentArrivalApplied);

  let newMod = 0;
  let newArrival = 0;

  if (isPositive) {
    if (isSuccess) {
      // Позитивный + Успех = удвоение
      newMod = (currentSign.mod || 0) * 2;
      newArrival = (currentSign.arrivalBonus || 0) * 2;
    } else {
      // Позитивный + Провал = становится отрицательным
      newMod = (currentSign.mod || 0) * -1;
      newArrival = (currentSign.arrivalBonus || 0) * -1;
    }
  } else {
    // Негативный
    if (isSuccess) {
      // Негативный + Успех = становится положительным
      newMod = (currentSign.mod || 0) * -1;
      newArrival = (currentSign.arrivalBonus || 0) * -1;
    } else {
      // Негативный + Провал = удвоение негатива
      newMod = (currentSign.mod || 0) * 2;
      newArrival = (currentSign.arrivalBonus || 0) * 2;
    }
  }

  // Применяем новые значения
  currentModApplied = newMod;
  currentArrivalApplied = newArrival;
  addSignMod(newMod);
  addArrivalBonus(newArrival);

  // Обновляем UI с результатом проверки
  updateSignUI(currentSign, true, isSuccess, newMod, newArrival);
}

// ============================================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ЗНАКА
// ============================================================

function updateSignUI(sign, isChecked, isSuccess, modValue, arrivalValue) {
  let metaHtml = 'Выпало: <strong>' + sign.title + '</strong>';
  
  if (sign.mod !== 0 && !isChecked) {
    const modClass = sign.mod > 0 ? 'mod-positive' : 'mod-negative';
    const modText = sign.mod > 0 ? '+' + sign.mod : '' + sign.mod;
    metaHtml += ' | Изменение сложности: <strong class="' + modClass + '">' + modText + '</strong>';
  }
  
  if (sign.arrivalBonus && !isChecked) {
    const arrClass = sign.arrivalBonus > 0 ? 'mod-negative' : 'mod-positive';
    const arrText = sign.arrivalBonus > 0 ? '+' + sign.arrivalBonus : '' + sign.arrivalBonus;
    metaHtml += ' | Прибытие: <strong class="' + arrClass + '">' + arrText + '</strong>';
  }

  if (isChecked) {
    const resultText = isSuccess ? 'Успех!' : 'Провал...';
    const resultColor = isSuccess ? '#51cf66' : '#ff6b6b';
    metaHtml += '<br><span style="color: ' + resultColor + '; font-weight: bold;">Око Предзнаменования: ' + resultText + '</span>';
    
    if (sign.isNumeric) {
      if (modValue !== 0) {
        const modClass = modValue > 0 ? 'mod-positive' : 'mod-negative';
        metaHtml += ' | Итоговая сложность: <strong class="' + modClass + '">' + (modValue > 0 ? '+' + modValue : modValue) + '</strong>';
      }
      if (arrivalValue !== 0) {
        const arrClass = arrivalValue > 0 ? 'mod-negative' : 'mod-positive';
        metaHtml += ' | Итоговое Прибытие: <strong class="' + arrClass + '">' + (arrivalValue > 0 ? '+' + arrivalValue : arrivalValue) + '</strong>';
      }
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
  
  // Сбрасываем все примененные бонусы
  if (currentSign) {
    addSignMod(-currentModApplied);
    addArrivalBonus(-currentArrivalApplied);
  }
  
  currentSign = null;
  currentModApplied = 0;
  currentArrivalApplied = 0;

  resetSignMod();
  resetArrivalBonus();
  updateDifficulty();
  
  signResult.classList.remove('visible');
  signPlaceholder.style.display = 'block';
  
  signMeta.innerHTML = '<span style="color:#51cf66;">✅ Эффекты всех знаков (включая Прибытие) сброшены</span>';
  signResult.classList.add('visible');
  signPlaceholder.style.display = 'none';
  
  setTimeout(function() {
    signResult.classList.remove('visible');
    signPlaceholder.style.display = 'block';
  }, 2000);
}
