// ============================================================
// МЕТКИ ОТЧЁТОВ (РЕСУРСЫ И НОЧЛЕГИ)
// ============================================================

var reportMarkerOverlays = [];

async function loadReportMarkers() {
  reportMarkerOverlays.forEach(function(overlay) {
    map.removeOverlay(overlay);
  });
  reportMarkerOverlays = [];

  try {
    var result = await _supabase
      .from('game_reports')
      .select('id, region_id, marker_type, marker_x, marker_y')
      .not('marker_x', 'is', null)
      .not('marker_y', 'is', null);

    if (result.error) {
      console.error('Ошибка загрузки меток:', result.error);
      return;
    }

    var reports = result.data || [];
    console.log('Загружено ' + reports.length + ' меток отчётов');

    reports.forEach(function(report) {
      var iconSrc = '';
      var tooltipText = '';
      
      if (report.marker_type === 'resource') {
        iconSrc = '/CHERTOGI_MAP/icons/resurs.png';
        tooltipText = 'Место ресурса';
      } else if (report.marker_type === 'shelter') {
        iconSrc = '/CHERTOGI_MAP/icons/Nochleg.png';
        tooltipText = 'Место безопасного ночлега';
      } else {
        return;
      }

      createReportMarker(
        report.id,
        report.region_id,
        report.marker_x,
        report.marker_y,
        iconSrc,
        tooltipText
      );
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
        .eq('
