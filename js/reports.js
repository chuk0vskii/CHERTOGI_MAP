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
    console.error('Ошибка загрузки отчётов:', result.error);
    reportsList.innerHTML = '<p style="color: #ff6b6b; font-size: 14px;">Ошибка загрузки</p>';
    return;
  }

  var data = result.data;
  if (!data || data.length === 0) {
    reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">Пока нет отчётов для этого региона</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.length; i++) {
    var report = data[i];
    var reportId = 'report-' + report.id;
    
    var fullContent = '';
    
    if (report.keeper_name) {
      fullContent += '<div style="color: #aaa; font-size: 13px; margin-top: 6px;"><span style="color: #888;">Хранитель узлов:</span> ' + report.keeper_name + '</div>';
    }
    
    if (report.content) {
      fullContent += '<div style="color: #e0d5c0; font-size: 14px; line-height: 1.5; margin-top: 6px;">' + report.content + '</div>';
    }
    
    if (report.deceased_names && report.deceased_names.length > 0) {
      fullContent += '<div style="color: #ff6b6b; font-size: 13px; margin-top: 4px;"><span style="color: #888;">Умершие:</span> ' + report.deceased_names.join(', ') + '</div>';
    }
    
    var points = [];
    if (report.has_resource) points.push('🏕️ Место ресурса');
    if (report.has_shelter) points.push('🛏️ Место ночлега');
    if (points.length > 0) {
      fullContent += '<div style="color: #51cf66; font-size: 13px; margin-top: 2px;"><span style="color: #888;">Точки интереса:</span> ' + points.join(', ') + '</div>';
    }
    
    if (!fullContent) {
      fullContent = '<div style="color: #888; font-size: 13px; margin-top: 4px;">Нет дополнительной информации</div>';
    }
    
    var dateStr = new Date(report.created_at).toLocaleDateString('ru-RU');
    var timeStr = new Date(report.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    html += `
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border-left: 2px solid rgba(255,215,0,0.2); cursor: pointer;" onclick="toggleReport('${reportId}')">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #aaa; font-size: 12px;">${dateStr} ${timeStr}</span>
          <span style="color: #555; font-size: 10px;">#${report.id}</span>
        </div>
        <div id="${reportId}" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
          ${fullContent}
        </div>
      </div>
    `;
  }
  
  reportsList.innerHTML = html;
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВИДИМОСТИ ОТЧЁТА
// ============================================================

function toggleReport(reportId) {
  var element = document.getElementById(reportId);
  if (element) {
    if (element.style.display === 'none') {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  }
}

// ============================================================
// ГЕНЕРАЦИЯ СЛУЧАЙНЫХ КООРДИНАТ В ДИАПАЗОНЕ ОТ ТОЧКИ
// ============================================================

function generateRandomMarkerPosition(centerX, centerY, minDist, maxDist) {
  // Генерируем случайное расстояние и угол
  var distance = minDist + Math.random() * (maxDist - minDist);
  var angle = Math.random() * 2 * Math.PI;
  
  var dx = Math.cos(angle) * distance;
  var dy = Math.sin(angle) * distance;
  
  return {
    x: centerX + dx,
    y: centerY + dy
  };
}

// ============================================================
// ОТПРАВКА ОТЧЁТА (с созданием меток)
// ============================================================

async function submitReport(regionId, content, keeperName, deceasedNames, hasResource, hasShelter) {
  // Получаем координаты региона для размещения меток
  var regionResult = await _supabase
    .from('regions')
    .select('x, y')
    .eq('id', regionId)
    .single();
  
  if (regionResult.error) {
    console.error('Ошибка получения координат региона:', regionResult.error);
    return { success: false, error: 'Не удалось получить координаты региона' };
  }
  
  var regionX = regionResult.data.x;
  var regionY = regionResult.data.y;
  
  // Подготавливаем данные для вставки
  var insertData = {
    region_id: regionId,
    keeper_name: keeperName || null,
    content: content,
    deceased_names: deceasedNames && deceasedNames.length > 0 ? deceasedNames : null,
    has_resource: hasResource || false,
    has_shelter: hasShelter || false,
    game_date: new Date().toISOString().split('T')[0]
  };
  
  // Если выбран ресурс, генерируем координаты
  if (hasResource) {
    var pos = generateRandomMarkerPosition(regionX, regionY, 70, 180);
    insertData.marker_type = 'resource';
    insertData.marker_x = pos.x;
    insertData.marker_y = pos.y;
  }
  // Если выбран ночлег (и нет ресурса) или выбран только ночлег
  else if (hasShelter) {
    var pos = generateRandomMarkerPosition(regionX, regionY, 70, 180);
    insertData.marker_type = 'shelter';
    insertData.marker_x = pos.x;
    insertData.marker_y = pos.y;
  }
  // Если выбраны и ресурс, и ночлег — создаём две записи?
  // В текущей реализации — только одна метка (приоритет у ресурса)
  // Можно создать две метки, но тогда нужно дублировать отчёт или создать отдельную таблицу для меток
  
  var result = await _supabase
    .from('game_reports')
    .insert([insertData]);

  if (result.error) {
    console.error('Ошибка отправки отчёта:', result.error);
    return { success: false, error: result.error.message };
  }

  // После сохранения отчёта обновляем карту
  if (typeof loadMarkers === 'function') {
    await loadMarkers();
  }
  if (typeof loadReportMarkers === 'function') {
    await loadReportMarkers();
  }

  return { success: true, data: result.data };
}
