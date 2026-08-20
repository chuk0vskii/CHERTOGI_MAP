// ===== АДМИН-ПАНЕЛЬ =====
let adminRegionsData = [];

// ===== ЗАГРУЗКА РЕГИОНОВ ДЛЯ АДМИНКИ =====
async function loadAdminRegions() {
  const { data, error } = await _supabase
    .from('regions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Ошибка загрузки:', error);
    return;
  }

  adminRegionsData = data;
  renderAdminPanel(data);
}

// ===== ОТРИСОВКА АДМИН-ПАНЕЛИ =====
function renderAdminPanel(regions) {
  const container = document.getElementById('admin-regions-list');
  if (!container) return;

  container.innerHTML = regions.map(region => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <span style="font-size: 13px;">${region.name}</span>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
        <input type="checkbox" 
               data-id="${region.id}" 
               ${region.is_open ? 'checked' : ''}
               style="width: 18px; height: 18px; cursor: pointer; accent-color: #ffd700;">
        <span style="font-size: 11px; color: ${region.is_open ? '#4caf50' : '#888'};">
          ${region.is_open ? '✅ Открыт' : '🔒 Закрыт'}
        </span>
      </label>
    </div>
  `).join('');

  // Навешиваем обработчики на чекбоксы
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const id = parseInt(this.dataset.id);
      const isOpen = this.checked;
      updateRegionStatus(id, isOpen);
    });
  });
}

// ===== ОБНОВЛЕНИЕ СТАТУСА РЕГИОНА =====
async function updateRegionStatus(id, isOpen) {
  const { error } = await _supabase
    .from('regions')
    .update({ is_open: isOpen })
    .eq('id', id);

  if (error) {
    console.error('❌ Ошибка обновления:', error);
    alert('Не удалось обновить статус');
    return;
  }

  console.log(`✅ Регион ${id} ${isOpen ? 'открыт' : 'закрыт'}`);
  
  // Обновляем отображение чекбокса
  const label = document.querySelector(`input[data-id="${id}"]`).closest('label');
  const span = label.querySelector('span');
  if (span) {
    span.textContent = isOpen ? '✅ Открыт' : '🔒 Закрыт';
    span.style.color = isOpen ? '#4caf50' : '#888';
  }

  // Обновляем карту (перезагружаем маркеры и облака)
  if (typeof loadMarkers === 'function') {
    await loadMarkers();
  }
  if (typeof loadClouds === 'function') {
    await loadClouds();
  }
}

// ===== ТОГГЛ АДМИН-ПАНЕЛИ =====
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('admin-toggle-btn');
  const panel = document.getElementById('admin-panel');
  const closeBtn = document.getElementById('admin-close-btn');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', function() {
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'block';
        loadAdminRegions();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        panel.style.display = 'none';
      });
    }
  }
});
