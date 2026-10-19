// ============================================================
// ЗАГРУЗКА И ОТПРАВКА ОТЧЁТОВ
// ============================================================

async function loadReports(regionId) {
  var reportsList = document.getElementById('reports-list');
  if (!reportsList) return;
  
  reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">Загрузка...</p>';
  
  // Загружаем ТОЛЬКО одобренные отчеты для отображения на карте
  var result = await _supabase
    .from('game_reports')
    .select('*')
    .eq('region_id', regionId)
    .eq('is_approved', true)
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
      fullContent += '<div style="color: #aaa; font-size: 13px; margin-top: 6px;"><span style="color: #888;">Хранитель узлов:</span> ' + escapeHtml(report.keeper_name) + '</div>';
    }
    
    if (report.content) {
      fullContent += '<div style="color: #e0d5c0; font-size: 14px; line-height: 1.5; margin-top: 6px;">' + escapeHtml(report.content) + '</div>';
    }
    
    if (report.deceased_names && report.deceased_names.length > 0) {
      var namesEscaped = report.deceased_names.map(function(n) { return escapeHtml(n); }).join(', ');
      fullContent += '<div style="color: #ff6b6b; font-size: 13px; margin-top: 4px;"><span style="color: #888;">Умершие:</span> ' + namesEscaped + '</div>';
    }
    
    var points = [];
    if (report.has_resource) points.push('Место ресурса');
    if (report.has_shelter) points.push('Место ночлега');
    if (points.length > 0) {
      fullContent += '<div style="color: #51cf66; font-size: 13px; margin-top: 2px;"><span style="color: #888;">Точки интереса:</span> ' + points.join(', ') + '</div>';
    }
    
    if (!fullContent) {
      fullContent = '<div style="color: #888; font-size: 13px; margin-top: 4px;">Нет дополнительной информации</div>';
    }
    
    var dateStr = new Date(report.created_at).toLocaleDateString('ru-RU');
    var timeStr = new Date(report.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    // Кнопка редактирования (появляется только если введен пароль)
    var editBtnHTML = '';
    if (typeof isReportAuthorized === 'function' && isReportAuthorized()) {
      var safeContent = encodeURIComponent(report.content || '');
      editBtnHTML = `
        <button class="btn-edit-report" 
                data-id="${report.id}" 
                data-content="${safeContent}" 
                style="background: rgba(74,14,14,0.6); border: 1px solid #4a0e0e; color: #ffd700; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-family: 'Philosopher', sans-serif; font-size: 12px; margin-top: 8px; transition: all 0.3s;">
          ✏️ Редактировать
        </button>
      `;
    }

    html += `
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border-left: 2px solid rgba(255,215,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleReport('${reportId}')">
          <span style="color: #aaa; font-size: 12px;">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</span>
          <span style="color: #555; font-size: 10px;">#${escapeHtml(report.id)}</span>
        </div>
        <div id="${reportId}" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
          ${fullContent}
          ${editBtnHTML}
        </div>
      </div>
    `;
  }
  
  reportsList.innerHTML = html;

  // Навешиваем обработчики на кнопки редактирования
  document.querySelectorAll('.btn-edit-report').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = parseInt(this.dataset.id);
      var content = decodeURIComponent(this.dataset.content);
      if (typeof openEditReportModal === 'function') {
        openEditReportModal(id, content);
      }
    });
  });
}

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
