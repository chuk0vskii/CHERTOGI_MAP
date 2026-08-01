function createHexElement(hexId) {
  const hex = document.createElement('div');
  hex.className = 'hex';
  hex.dataset.id = hexId;
  
  const state = hexData[hexId];
  if (!state) {
    hex.textContent = '?';
    hex.style.background = '#333';
    return hex;
  }

  // ===== ФИКСИРОВАННЫЙ РАЗМЕР 2133x1846 =====
  hex.style.width = '2133px';
  hex.style.height = '1846px';

  if (state.unlocked) {
    hex.classList.add('unlocked');
    hex.style.background = `linear-gradient(135deg, #4a7c59, #2d5a3d)`;
    hex.style.borderColor = 'rgba(255,215,0,0.6)';
  } else {
    hex.classList.add('locked');
    hex.style.background = `linear-gradient(135deg, #3d3d3d, #1a1a1a)`;
    hex.style.borderColor = 'rgba(100,100,100,0.3)';
  }

  const nameSpan = document.createElement('span');
  nameSpan.className = 'hex-name';
  nameSpan.textContent = state.name || hexId;
  nameSpan.style.fontSize = '180px';  // Фиксированный размер шрифта
  hex.appendChild(nameSpan);

  hex.addEventListener('click', () => showInfo(hexId));
  return hex;
}
