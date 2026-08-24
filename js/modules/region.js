// ============================================================
// УПРАВЛЕНИЕ РЕГИОНОМ И СЛОЖНОСТЬЮ
// ============================================================

import { _supabase } from '../config.js';

let currentRegionId = null;
let baseDifficulty = 0;
let currentSignMod = 0;

const regionSelect = document.getElementById('regionSelect');
const difficultyDisplay = document.getElementById('difficultyValue');
const pathDifficultyDisplay = document.getElementById('pathDifficultyDisplay');

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
// ЗАГРУЗКА РЕГИОНОВ ИЗ SUPABASE
// ============================================================

export async function loadRegions() {
  console.log('🔄 Загрузка регионов...');
  
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
      console.warn('⚠️ Нет открытых регионов');
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
