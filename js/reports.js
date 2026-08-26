// ===== ЗАГРУЗКА ОТЧЁТОВ =====
async function loadReports(regionId) {
  reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">Загрузка...</p>';
  const { data, error } = await _supabase
    .from('game_reports')
    .select('*')
    .eq('region_id', regionId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Ошибка загрузки отчётов:', error);
    reportsList.innerHTML = '<p style="color: #ff6b6b; font-size: 14px;">❌ Ошибка загрузки</p>';
    return;
  }

  if (!data || data.length === 0) {
    reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">📭 Пока нет отчётов для этого региона</p>';
    return;
  }

  reportsList.innerHTML = data.map(report => `
    <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border-left: 3px solid rgba(255, 215, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="color: #aaa; font-size: 11px;">🗓️ ${new Date(report.created_at).toLocaleDateString('ru-RU')} ${report.user_name ? ` · ${report.user_name}` : ''}</span>
        <span style="color: #555; font-size: 10px;">#${report.id}</span>
      </div>
      <div style="color: #e0d5c0; font-size: 14px; line-height: 1.4; word-wrap: break-word;">${report.content}</div>
    </div>
  `).join('');
}

// ===== МОДАЛЬНОЕ ОКНО =====
const modal = document.getElementById('report-modal');
const modalRegionName = document.getElementById('modal-region-name');
const reportAuthor = document.getElementById('report-author');
const reportContent = document.getElementById('report-content');

document.getElementById('report-btn').addEventListener('click', function() {
  if (!currentRegionId) return;
  const regionName = sidebarTitle.textContent;
  modalRegionName.textContent = `📍 Регион: ${regionName}`;
  reportAuthor.value = '';
  reportContent.value = '';
  modal.style.display = 'flex';
});

function closeModal() {
  modal.style.display = 'none';
}

document.getElementById('cancel-report-btn').addEventListener('click', closeModal);
modal.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== ОТПРАВКА ОТЧЁТА =====
document.getElementById('submit-report-btn').addEventListener('click', async function() {
  const content = reportContent.value.trim();
  const author = reportAuthor.value.trim() || 'Аноним';

  if (!content) {
    alert('Напишите текст отчёта');
    return;
  }

  const { data, error } = await _supabase
    .from('game_reports')
    .insert([{
      region_id: currentRegionId,
      user_name: author,
      content: content,
      game_date: new Date().toISOString().split('T')[0]
    }]);

  if (error) {
    alert('❌ Ошибка: ' + error.message);
    return;
  }

  alert('✅ Отчёт сохранён!');
  closeModal();
  loadReports(currentRegionId);
});
