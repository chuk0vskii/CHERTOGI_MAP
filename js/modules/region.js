// ============================================================
// УПРАВЛЕНИЕ РЕГИОНОМ, СЛОЖНОСТЬЮ И ПРИБЫТИЕМ
// ============================================================

import { _supabase } from '../config-module.js';

let currentRegionId = null;
let baseDifficulty = 0;
let currentSignMod = 0;
let arrivalBonus = 0;           // Накопленный бонус прибытия из событий

const regionSelect = document.getElementById('regionSelect');
const difficultyDisplay = document.getElementById('difficultyValue');
const pathDifficultyDisplay = document.getElementById('pathDifficultyDisplay');
const arrivalDisplay = document.getElementById('arrivalValue');
const arrivalTotalDisplay = document.getElementById('arrivalTotal');

// ============================================================
// ОБНОВЛЕНИЕ СЛОЖНОСТИ
// ============================================================

export function updateDifficulty() {
  const total = baseDifficulty + currentSignMod;
  const display = total < 0 ? 0 : total;
  
  if (difficultyDisplay) {
    difficultyDisplay.textContent = display;
    const color = currentSignMod > 0 ? '#ff6b6b' : currentSignMod < 0 ? '#51cf66' : '#ffd700';
    difficultyDisplay.style.color = color;
  }
  
  if (pathDifficultyDisplay) {
    pathDifficultyDisplay.textContent = display;
    const color = currentSignMod > 0 ? '#ff6b6b' : currentSignMod < 0 ? '#51cf66' : '#ffd700';
    pathDifficultyDisplay.style.color = color;
  }
  
  updateArrivalDisplay();
}

// ============================================================
// ОБНОВЛЕНИЕ ПРИБЫТИЯ
// ============================================================

export function updateArrivalDisplay() {
  if (arrivalDisplay) {
    arrivalDisplay.textContent = arrivalBonus;
    const color = arrivalBonus > 0 ? '#51cf66' : arrivalBonus < 0 ? '#ff6b6b' : '#ffd700';
    arrivalDisplay.style.color = color;
  }
  if (arrivalTotalDisplay) {
    arrivalTotalDisplay.textContent = arrivalBonus;
    const color = arrivalBonus > 0 ? '#51cf66' : arrivalBonus < 0 ? '#ff6b6b' : '#ffd700';
    arrivalTotalDisplay.style.color = color;
  }
}

// ============================================================
// ГЕТТЕРЫ И СЕТТЕРЫ
// ============================================================

export function getRegionId() { return currentRegionId; }
export function setRegionId(id) { currentRegionId = id; }

export function getBaseDifficulty() { return baseDifficulty; }
export function setBaseDifficulty(val) { baseDifficulty = val; updateDifficulty(); }

export function getCurrentSignMod() { return currentSignMod; }
export function setCurrentSignMod(val) { currentSignMod = val; updateDifficulty(); }

export function addSignMod(val) { currentSignMod += val; updateDifficulty(); }
export function resetSignMod() { currentSignMod = 0; updateDifficulty(); }

// ============================================================
// УПРАВЛЕНИЕ ПРИБЫТИЕМ (КВАРНЫ)
// ============================================================

export function getArrivalBonus() { return arrivalBonus; }
export function setArrivalBonus(val) { arrivalBonus = val; updateArrivalDisplay(); }
export function addArrivalBonus(val) { 
  arrivalBonus += val; 
  updateArrivalDisplay();
  console.log(`🏆 Кварны прибытия изменены: ${arrivalBonus}`);
}
export function resetArrivalBonus() { 
  arrivalBonus = 0; 
  updateArrivalDisplay();
}

// ============================================================
// ЗАГРУЗКА РЕГИОНОВ
// ============================================================

export async function loadRegions() {
  console.log('🔄 Загрузка регионов...');
  
  if (!regionSelect) {
    console.error('❌ regionSelect не найден');
    return;
  }
  
  try {
    const { data, error } = await _supabase
      .from('regions')
      .select('id, name, difficulty, common_events, max_role_events, role_bonus')
      .eq('is_active', true)
      .eq('is_open', true)
      .order('name');

    if (error) {
      console.error('❌ Ошибка загрузки регионов:', error);
      return;
    }

    if (!data || data.length === 0) {
      regionSelect.innerHTML = '<option value="">— Нет доступных краев —</option>';
      return;
    }

    regionSelect.innerHTML = '<option value="">— Выберите край —</option>';
    data.forEach(region => {
      const option = document.createElement('option');
      option.value = region.id;
      option.textContent = region.name;
      option.dataset.difficulty = region.difficulty || 0;
      option.dataset.commonEvents = region.common_events || 0;
      option.dataset.maxRoleEvents = region.max_role_events || 0;
      option.dataset.roleBonus = region.role_bonus || 0;
      regionSelect.appendChild(option);
    });

    console.log(`✅ Загружено ${data.length} открытых регионов`);
  } catch (err) {
    console.error('❌ Ошибка при загрузке регионов:', err);
  }
}

// ============================================================
// ОБРАБОТЧИК СМЕНЫ РЕГИОНА
// ============================================================

export function initRegionChangeHandler() {
  if (!regionSelect) return;
  
  regionSelect.addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    
    if (this.value && this.value !== '') {
      const id = parseInt(this.value);
      const difficulty = parseInt(selected.dataset.difficulty) || 0;
      
      console.log('📌 Выбран регион ID:', id, 'Сложность:', difficulty);
      
      setRegionId(id);
      setBaseDifficulty(difficulty);
      resetSignMod();
      resetArrivalBonus();  // Сбрасываем кварны при смене региона
      
      // Сбрасываем UI
      const signResult = document.getElementById('signResult');
      const signPlaceholder = document.getElementById('signPlaceholder');
      if (signResult) signResult.classList.remove('visible');
      if (signPlaceholder) signPlaceholder.style.display = 'block';
      
      const eventsContainer = document.getElementById('eventsContainer');
      if (eventsContainer) {
        eventsContainer.innerHTML = '<div class="no-events">Выберите край и нажмите «Сгенерировать события пути»</div>';
      }
      
      document.getElementById('commonEventsCount').textContent = '—';
      document.getElementById('maxRoleEvents').textContent = '—';
      document.getElementById('roleEventsCount').textContent = '—';
      document.getElementById('totalEventsCount').textContent = '—';
    } else {
      console.log('📌 Регион сброшен');
      setRegionId(null);
      setBaseDifficulty(0);
      resetSignMod();
      resetArrivalBonus();
      
      if (difficultyDisplay) {
        difficultyDisplay.textContent = '—';
        difficultyDisplay.style.color = '#ffd700';
      }
      if (pathDifficultyDisplay) {
        pathDifficultyDisplay.textContent = '—';
        pathDifficultyDisplay.style.color = '#ffd700';
      }
      if (arrivalDisplay) {
        arrivalDisplay.textContent = '0';
        arrivalDisplay.style.color = '#ffd700';
      }
      if (arrivalTotalDisplay) {
        arrivalTotalDisplay.textContent = '0';
        arrivalTotalDisplay.style.color = '#ffd700';
      }
    }
  });
}
