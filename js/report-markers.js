// ============================================================
// МЕТКИ ОТЧЁТОВ (РЕСУРСЫ, НОЧЛЕГИ, РУИНЫ)
// ============================================================

var reportMarkerOverlays = [];

async function loadReportMarkers() {
  // Очищаем старые маркеры
  reportMarkerOverlays.forEach(function(overlay) {
    map.removeOverlay(overlay);
  });
  reportMarkerOverlays = [];

  try {
    var result = await _supabase
      .from('game_reports')
      .select('id, region_id, marker_type, marker_x, marker_y, resources, shelters, ruins')
      .eq('is_approved', true);

    if (result.error) {
      console.error('Ошибка загрузки меток:', result.error);
      return;
    }

    var reports = result.data || [];
    console.log('Загружено ' + reports.length + ' отчётов для меток');

    reports.forEach(function(report) {
      // 1. Обработка НОВЫХ меток из jsonb-массивов
      if (report.resources && Array.isArray(report.resources)) {
        report.resources.forEach(function(m) {
          createReportMarker(report.id, report.region_id, m.x, m.y, '/CHERTOGI_MAP/icons/resurs.png', 'Место ресурса');
        });
      }
      
      if (report.shelters && Array.isArray(report.shelters)) {
        report.shelters.forEach(function(m) {
          createReportMarker(report.id, report.region_id, m.x, m.y, '/CHERTOGI_MAP/icons/Nochleg.png', 'Место безопасного ночлега');
        });
      }
      
      if (report.ruins && Array.isArray(report.ruins)) {
        report.ruins.forEach(function(m) {
          createReportMarker(report.id, report.region_id, m.x, m.y, '/CHERTOGI_MAP/icons/ruins.png', 'Руины');
        });
      }

      // 2. Обработка СТАРЫХ меток (для обратной совместимости)
      if (report.marker_x != null && report.marker_y != null) {
        // Проверяем, есть ли эта метка уже в новых массивах, чтобы не дублировать
        var isDuplicate = false;
        
        if (report.marker_type === 'resource' && report.resources) {
          isDuplicate = report.resources.some(function(m) { return Math.abs(m.x - report.marker_x) < 0.1 && Math.abs(m.y - report.marker_y) < 0.1; });
        } else if (report.marker_type === 'shelter' && report.shelters) {
          isDuplicate = report.shelters.some(function(m) { return Math.abs(m.x - report.marker_x) < 0.1 && Math.abs(m.y - report.marker_y) < 0.1; });
        }

        if (!isDuplicate) {
          var iconSrc = '';
          var tooltipText = '';
          
          if (report.marker_type === 'resource') {
            iconSrc = '/CHERTOGI_MAP/icons/resurs.png';
            tooltipText = 'Место ресурса';
          } else if (report.marker_type === 'shelter') {
            iconSrc = '/CHERTOGI_MAP/icons/Nochleg.png';
            tooltipText = 'Место безопасного ночлега';
          }

          if (iconSrc) {
            createReportMarker(report.id, report.region_id, report.marker_x, report.marker_y, iconSrc, tooltipText);
          }
        }
      }
    });

  } catch (err) {
    console.error('Ошибка загрузки меток:', err);
  }
}

function createReportMarker(reportId, regionId, x, y, iconSrc, tooltipText) {
  var element = document.createElement('div');
  element.className = 'marker-button report-marker';
  element.innerHTML = `
    <img src="${iconSrc}" alt="${tooltipText}" width="24" height="24">
    <span class="marker-tooltip">${tooltipText}</span>
  `;

  element.addEventListener('mouseenter', function() {
    var img = this.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1.2)';
      img.style.transition = 'transform 0.2s ease';
    }
  });

  element.addEventListener('mouseleave', function() {
    var img = this.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1)';
    }
  });

  element.addEventListener('click', function(e) {
    e.stopPropagation();
    if (typeof openSidebar === 'function') {
      _supabase
        .from('regions')
        .select('name, description, difficulty')
        .eq('id', regionId)
        .single()
        .then(function(result) {
          if (!result.error && result.data) {
            openSidebar(regionId, result.data.name, result.data.description, result.data.difficulty);
            setTimeout(function() {
              var reportElement = document.getElementById('report-' + reportId);
              if (reportElement) {
                reportElement.style.display = 'block';
                reportElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Подсветка
                reportElement.style.background = 'rgba(255,215,0,0.1)';
                reportElement.style.borderLeft = '2px solid #ffd700';
                setTimeout(function() {
                  reportElement.style.background = '';
                  reportElement.style.borderLeft = '';
                }, 3000);
              }
            }, 300);
          }
        });
    }
  });

  var overlay = new ol.Overlay({
    element: element,
    position: [x, y],
    positioning: 'bottom-center',
    offset: [0, -8],
    stopEvent: false
  });

  map.addOverlay(overlay);
  reportMarkerOverlays.push(overlay);
}

console.log('report-markers.js загружен');
