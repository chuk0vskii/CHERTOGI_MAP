// ============================================================
// ФАЗА ЗНАКИ
// ============================================================

// _supabase доступен глобально из config.js

const signInput = document.getElementById('signInput');
const drawBtn = document.getElementById('drawSignBtn');
const resetSignsBtn = document.getElementById('resetSignsBtn');
const signResult = document.getElementById('signResult');
const signPlaceholder = document.getElementById('signPlaceholder');
const signTitle = document.getElementById('signTitle');
const signDescription = document.getElementById('signDescription');
const signMeta = document.getElementById('signMeta');
const signImage = document.getElementById('signImage');

let signHistory = [];

// ============================================================
// БРОСОК ЗНАКА
// ============================================================

function drawSign() {
  const regionId = window.getRegionId ? window.getRegionId() : null;
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

  const sign = window.SIGNS ? window.SIGNS[index] : null;
  if (!sign) {
    alert('Знак не найден. Попробуйте другое число.');
    return;
  }

  if (window.addSignMod) window.addSignMod(sign.mod);
  signHistory.push({ index, title: sign.title, mod: sign.mod });

  signTitle.textContent = sign.title;
  signDescription.textContent = sign.description;

  let metaHtml = 'Выпало: <strong>' + value + '</strong>';
  if (sign.mod !== 0) {
    const modClass = sign.mod > 0 ? 'mod-positive' : 'mod-negative';
    const modText = sign.mod > 0 ? '+' + sign.mod : '' + sign.mod;
    metaHtml += ' | Изменение сложности: <strong class="' + modClass + '">' + modText + '</strong>';
  }
  
  const totalMod = signHistory.reduce(function(sum, s) { return sum + s.mod; }, 0);
  metaHtml += '<br><span style="font-size:12px; color:rgba(255,255,255,0.4);">Накопленный модификатор: ' + (totalMod > 0 ? '+' : '') + totalMod + '</span>';
  
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

  signResult.classList.add('visible');
  signPlaceholder.style.display = 'none';
}

// ============================================================
// СБРОС
// ============================================================

function resetSigns() {
  const regionId = window.getRegionId ? window.getRegionId() : null;
  if (regionId === null || regionId === undefined) {
    alert('Сначала выберите край');
    return;
  }
  
  if (window.resetSignMod) window.resetSignMod();
  signHistory = [];
  if (window.updateDifficulty) window.updateDifficulty();
  
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

// Делаем глобальными
window.drawSign = drawSign;
window.resetSigns = resetSigns;
