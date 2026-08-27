// ============================================================
// ЗАГРУЗКА И ОТПРАВКА ОТЧЁТОВ
// ============================================================

// ============================================================
// ЗАГРУЗКА ОТЧЁТОВ
// ============================================================

async function loadReports(regionId) {
  var reportsList = document.getElementById('reports-list');
  if (!reportsList) return;
  
  reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">Загрузка...</p>';
  
  var result = await _supabase
    .from('game_reports')
    .select('*')
    .eq('region_id', regionId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (result.error) {
    console.error('❌ Ошибка загрузки отчётов:', result.error);
    reportsList.innerHTML = '<p style="color: #ff6b6b; font-size: 14px;">❌ Ошибка загрузки</p>';
    return;
  }

  var data = result.data;
  if (!data || data.length === 0) {
    reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">📭 Пока нет отчётов для этого региона</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.length; i++) {
    var report = data[i];
    
    // Умершие
    var deceasedHTML = '';
    if (report.deceased_names && report.deceased_names.length > 0) {
      deceasedHTML = '<div style="color: #ff6b6b; font-size: 12px; margin-top: 4px;">💀 Умершие: ' + report.deceased_names.join(', ') + '</div>';
    }
    
    // Ресурсы
    var resourcesHTML = '';
    var resources = [];
    if (report.has_resource) resources.push('📍 Место ресурса');
    if (report.has_shelter) resources.push('🏕️ Место ночлега');
    if (resources.length > 0) {
      resourcesHTML = '<div style="color: #51cf66; font-size: 12px; margin-top: 2px;">📦 Ресурсы: ' + resources.join(', ') + '</div>';
    }
    
    // Хранитель
    var keeperHTML = '';
    if (report.keeper_name) {
      keeperHTML = '<div style="color: #ffd700; font-size: 12px; margin-top: 2px;">👤 Хранитель: ' + report.keeper_name + '</div>';
    }
    
    html += `
      <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border-left: 3px solid rgba(255, 215, 0, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="color: #aaa; font-size: 11px;">🗓️ ${new Date(report.created_at).toLocaleDateString('ru-RU')}</span>
          <span style="color: #555; font-size: 10px;">#${report.id}</span>
        </div>
        ${keeperHTML}
        <div style="color: #e0d5c0; font-size: 14px; line-height: 1.4; word-wrap: break-word;">${report.content}</div>
        ${deceasedHTML}
        ${resourcesHTML}
      </div>
    `;
  }
  
  reportsList.innerHTML = html;
}

// ============================================================
// ОТПРАВКА ОТЧЁТА
// ============================================================

async function submitReport(regionId, content, keeperName, deceasedNames, hasResource, hasShelter) {
  var insertData = {
    region_id: regionId,
    keeper_name: keeperName || null,
    content: content,
    deceased_names: deceasedNames && deceasedNames.length > 0 ? deceasedNames : null,
    has_resource: hasResource || false,
    has_shelter: hasShelter || false,
    game_date: new Date().toISOString().split('T')[0]
  };

  var result = await _supabase
    .from('game_reports')
    .insert([insertData]);

  if (result.error) {
    console.error('❌ Ошибка отправки отчёта:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, data: result.data };
}
