// ============================================================
// БОКОВАЯ ПАНЕЛЬ
// ============================================================

let currentRegionId = null;
const sidebar = document.getElementById('region-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-description');
const reportsList = document.getElementById('reports-list');
const difficultyContainer = document.getElementById('region-difficulty');

// ============================================================
// КОНФИГУРАЦИЯ ПАРОЛЯ
// ============================================================

const REPORT_PASSWORD = 'CHERTOGI2024';
const STORAGE_KEY = 'chertogi_report_auth';
let isAuthorized = false;
let currentKeeper = '';

// ============================================================
// СОСТОЯНИЕ ДЛЯ РАЗМЕЩЕНИЯ МЕТОК
// ============================================================

let placementMode = null;
let tempMarkers = {
  resource: null,
  shelter: null
};
let mapClickListener = null;
let activePlacementType = null;

function loadAuthState() {
  try {
    var saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      var data = JSON.parse(saved);
      isAuthorized = data.isAuthorized || false;
      currentKeeper = data.currentKeeper || '';
      console.log('Загружено состояние авторизации:', isAuthorized ? 'Открыт' : 'Закрыт');
      return true;
    }
  } catch (e) {
    console.warn('Ошибка загрузки состояния:', e);
  }
  return false;
}

function saveAuthState() {
  try {
    var data = {
      isAuthorized: isAuthorized,
      currentKeeper: currentKeeper
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Ошибка сохранения состояния:', e);
  }
}

function isReportAuthorized() {
  return isAuthorized;
}

function setReportAuthorized(value) {
  isAuthorized = value;
  saveAuthState();
  console.log('Статус доступа к отчётам:', isAuthorized ? 'Открыт' : 'Закрыт');
}

function getCurrentKeeper() {
  return currentKeeper;
}

function setCurrentKeeper(name) {
  currentKeeper = name;
  saveAuthState();
}

function addDeceasedField() {
  var container = document.getElementById('deceased-container');
  if (!container) return;
  
  var div = document.createElement('div');
  div.className = 'deceased-field';
  div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
  div.innerHTML = `
    <input type="text" class="deceased-name" placeholder="Имя умершего персонажа..." style="flex:1; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px;">
    <button class="remove-deceased-btn" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: 18px; padding: 0 8px;">X</button>
  `;
  
  var removeBtn = div.querySelector('.remove-deceased-btn');
  removeBtn.addEventListener('click', function() {
    div.remove();
  });
  
  container.appendChild(div);
}

function getRegionImagePath(regionId) {
  return '/CHERTOGI_MAP/images/' + regionId;
}

function loadRegionImage(regionId) {
  var imgContainer = document.getElementById('region-image-placeholder');
  if (!imgContainer) return;
  
  imgContainer.textContent = '';
  imgContainer.style.display = 'flex';
  imgContainer.style.alignItems = 'center';
  imgContainer.style.justifyContent = 'center';
  imgContainer.style.overflow = 'hidden';
  imgContainer.style.backgroundColor = '#4a0e0e';
  
  var basePath = getRegionImagePath(regionId);
  var extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  var currentIndex = 0;
  
  function tryLoadNext() {
    if (currentIndex >= extensions.length) {
      imgContainer.style.backgroundImage = 'none';
      imgContainer.textContent = 'Нет изображения';
      imgContainer.style.color = 'rgba(255, 255, 255, 0.3)';
      imgContainer.style.fontSize = '14px';
      imgContainer.style.fontFamily = 'Philosopher, sans-serif';
      return;
    }
    
    var ext = extensions[currentIndex];
    var fullPath = basePath + ext;
    
    var img = new Image();
    img.onload = function() {
      imgContainer.style.backgroundImage = 'url(' + fullPath + ')';
      imgContainer.style.backgroundSize = 'cover';
      imgContainer.style.backgroundPosition = 'center';
      imgContainer.style.backgroundRepeat = 'no-repeat';
      imgContainer.textContent = '';
      console.log('Загружено изображение:', fullPath);
    };
    img.onerror = function() {
      currentIndex++;
      tryLoadNext();
    };
    img.src = fullPath;
  }
  
  tryLoadNext();
}

function openSidebar(regionId, name, description, difficulty) {
  currentRegionId = regionId;
  sidebarTitle.textContent = name;
  sidebarDesc.textContent = description || 'Описание отсутствует';

  loadRegionImage(regionId);

  if (difficultyContainer) {
    if (difficulty !== undefined && difficulty !== null) {
      difficultyContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin: 12px 0 16px 0; padding: 8px 12px; background: rgba(74, 14, 14, 0.4); border-radius: 6px; border-left: 3px solid #4a0e0e;">
          <span style="color: #aaa; font-size: 14px; font-family: "Philosopher", sans-serif;">Сложность пути:</span>
          <span style="color: #ffd700; font-size: 18px; font-weight: 700; font-family: "Philosopher", sans-serif;">${difficulty}</span>
        </div>
      `;
    } else {
      difficultyContainer.innerHTML = '';
    }
  }

  addReportSection();

  sidebar.style.display = 'block';
  sidebar.classList.add('open');
  setTimeout(() => { sidebar.style.transform = 'translateX(0)'; }, 10);
  loadReports(regionId);
  updateReportButton();
  updateKeeperDisplay();
}

function closeSidebar() {
  if (placementMode) {
    console.log('Режим размещения метки активен, сайдбар не закрывается');
    return;
  }
  
  sidebar.classList.remove('open');
  sidebar.style.transform = 'translateX(100%)';
  setTimeout(() => { sidebar.style.display = 'none'; }, 300);
}

document.getElementById('close-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  if (placementMode) {
    resetPlacementState();
  }
  closeSidebar();
});

function addReportSection() {
  var panelContent = document.querySelector('.panel-content');
  if (!panelContent) return;
  
  var existingSection = document.getElementById('report-section');
  if (existingSection) {
    existingSection.style.display = isAuthorized ? 'block' : 'none';
    return;
  }
  
  var section = document.createElement('div');
  section.id = 'report-section';
  section.style.cssText = 'margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: none;';
  
  section.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="color: #ffd700; font-family: "Calypso", serif; font-size: 18px; letter-spacing: 1px; font-weight: normal;">Создать отчёт</span>
        <button id="toggle-report-btn" style="background: transparent; border: 1px solid rgba(255,215,0,0.2); color: #ffd700; padding: 2px 12px; border-radius: 4px; cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px;">Свернуть</button>
      </div>
      
      <div id="report-fields" style="display: block;">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 13px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Имя Хранителя узлов</label>
          <input id="keeper-display" type="text" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffd700; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px;" readonly>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 13px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Текст отчёта</label>
          <textarea id="report-content" placeholder="Опишите события..." style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 14px; min-height: 60px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 13px; color: rgba(255,255,255,0.5);">Умершие персонажи</label>
            <button id="add-deceased-btn" style="background: rgba(74,14,14,0.3); border: 1px solid #4a0e0e; border-radius: 4px; color: #ffd700; padding: 2px 12px; cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px;">+ Добавить</button>
          </div>
          <div id="deceased-container"></div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <label style="font-size: 13px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 6px;">Точки интереса</label>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <label style="font-size: 14px; color: #e0d5c0; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="resource-check" style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer;">
              Место ресурса
            </label>
            <label style="font-size: 14px; color: #e0d5c0; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="shelter-check" style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer;">
              Место ночлега
            </label>
          </div>
          <div id="marker-placement-hint" style="display: none; margin-top: 8px; padding: 8px 12px; background: rgba(255,215,0,0.1); border-radius: 6px; border: 1px solid rgba(255,215,0,0.2); font-size: 13px; color: #ffd700;">
            Кликните на карту в то место, где хотите разместить метку
          </div>
          <div id="marker-placed-info" style="display: none; margin-top: 8px; padding: 8px 12px; background: rgba(81,207,102,0.1); border-radius: 6px; border: 1px solid rgba(81,207,102,0.2); font-size: 13px; color: #51cf66;">
            Метка размещена. Вы можете переместить её, кликнув в другое место.
          </div>
          <div id="marker-status" style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.3);">
            <span id="resource-status">Ресурс: не выбран</span>
            <span id="shelter-status" style="margin-left: 16px;">Ночлег: не выбран</span>
          </div>
        </div>
        
        <button id="submit-report-btn" style="width: 100%; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif; font-weight: bold; transition: all 0.3s;">Отправить отчёт</button>
      </div>
    </div>
  `;
  
  panelContent.appendChild(section);
  
  document.getElementById('toggle-report-btn')?.addEventListener('click', function() {
    var fields = document.getElementById('report-fields');
    if (fields) {
      if (fields.style.display === 'none') {
        fields.style.display = 'block';
        this.textContent = 'Свернуть';
      } else {
        fields.style.display = 'none';
        this.textContent = 'Развернуть';
      }
    }
  });
  
  document.getElementById('add-deceased-btn')?.addEventListener('click', addDeceasedField);
  document.getElementById('submit-report-btn')?.addEventListener('click', submitReportHandler);
  
  document.getElementById('resource-check')?.addEventListener('change', function() {
    if (this.checked) {
      activePlacementType = 'resource';
      startPlacementMode('resource');
    } else {
      removeTempMarker('resource');
      updateMarkerStatus();
      if (!document.getElementById('shelter-check')?.checked) {
        stopPlacementMode();
      } else {
        activePlacementType = 'shelter';
        startPlacementMode('shelter');
      }
    }
  });
  
  document.getElementById('shelter-check')?.addEventListener('change', function() {
    if (this.checked) {
      activePlacementType = 'shelter';
      startPlacementMode('shelter');
    } else {
      removeTempMarker('shelter');
      updateMarkerStatus();
      if (!document.getElementById('resource-check')?.checked) {
        stopPlacementMode();
      } else {
        activePlacementType = 'resource';
        startPlacementMode('resource');
      }
    }
  });
  
  addDeceasedField();
  updateKeeperDisplay();
  updateMarkerStatus();
  
  if (isAuthorized) {
    section.style.display = 'block';
  }
}

function updateReportSectionVisibility() {
  var section = document.getElementById('report-section');
  if (section) {
    section.style.display = isAuthorized ? 'block' : 'none';
  }
}

function updateKeeperDisplay() {
  var keeperDisplay = document.getElementById('keeper-display');
  if (keeperDisplay) {
    keeperDisplay.value = getCurrentKeeper() || (isAuthorized ? 'Не указан' : 'Войдите по паролю');
  }
}

function updateMarkerStatus() {
  var resourceCheck = document.getElementById('resource-check');
  var shelterCheck = document.getElementById('shelter-check');
  var resourceStatus = document.getElementById('resource-status');
  var shelterStatus = document.getElementById('shelter-status');
  
  if (resourceStatus) {
    var hasResource = resourceCheck && resourceCheck.checked;
    var hasResourcePos = tempMarkers.resource !== null;
    resourceStatus.textContent = 'Ресурс: ' + (hasResource ? (hasResourcePos ? 'размещён' : 'выберите место на карте') : 'не выбран');
    resourceStatus.style.color = hasResource ? (hasResourcePos ? '#51cf66' : '#ffd700') : 'rgba(255,255,255,0.3)';
  }
  
  if (shelterStatus) {
    var hasShelter = shelterCheck && shelterCheck.checked;
    var hasShelterPos = tempMarkers.shelter !== null;
    shelterStatus.textContent = 'Ночлег: ' + (hasShelter ? (hasShelterPos ? 'размещён' : 'выберите место на карте') : 'не выбран');
    shelterStatus.style.color = hasShelter ? (hasShelterPos ? '#51cf66' : '#ffd700') : 'rgba(255,255,255,0.3)';
  }
}

// ============================================================
// РЕЖИМ РАЗМЕЩЕНИЯ МЕТКИ НА КАРТЕ
// ============================================================

function startPlacementMode(type) {
  placementMode = type;
  
  var hint = document.getElementById('marker-placement-hint');
  if (hint) hint.style.display = 'block';
  
  var info = document.getElementById('marker-placed-info');
  if (info) info.style.display = 'none';
  
  var mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.cursor = 'crosshair';
  }
  
  if (mapClickListener) {
    map.un('click', mapClickListener);
  }
  
  mapClickListener = function(event) {
    var coord = event.coordinate;
    var x = coord[0];
    var y = coord[1];
    
    updateTempMarker(x, y, type);
    
    var info = document.getElementById('marker-placed-info');
    if (info) info.style.display = 'block';
    
    var hint = document.getElementById('marker-placement-hint');
    if (hint) hint.style.display = 'none';
    
    updateMarkerStatus();
  };
  
  map.on('click', mapClickListener);
  
  console.log('Режим размещения метки активирован:', type);
}

function stopPlacementMode() {
  placementMode = null;
  activePlacementType = null;
  
  var hint = document.getElementById('marker-placement-hint');
  if (hint) hint.style.display = 'none';
  
  var info = document.getElementById('marker-placed-info');
  if (info) info.style.display = 'none';
  
  var mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.cursor = '';
  }
  
  if (mapClickListener) {
    map.un('click', mapClickListener);
    mapClickListener = null;
  }
  
  console.log('Режим размещения метки деактивирован');
}

function updateTempMarker(x, y, type) {
  var iconSrc = type === 'resource' 
    ? '/CHERTOGI_MAP/icons/resurs.png' 
    : '/CHERTOGI_MAP/icons/Nochleg.png';
  
  var tooltipText = type === 'resource' ? 'Место ресурса' : 'Место безопасного ночлега';
  
  removeTempMarker(type);
  
  var element = document.createElement('div');
  element.className = 'marker-button temp-marker temp-marker-' + type;
  element.innerHTML = `
    <img src="${iconSrc}" alt="${tooltipText}" width="28" height="28">
    <span class="marker-tooltip">${tooltipText}</span>
  `;
  element.style.opacity = '0.7';
  
  var overlay = new ol.Overlay({
    element: element,
    position: [x, y],
    positioning: 'bottom-center',
    offset: [0, -8],
    stopEvent: false
  });
  
  map.addOverlay(overlay);
  tempMarkers[type] = {
    overlay: overlay,
    position: { x: x, y: y }
  };
  
  console.log('Временная метка ' + type + ' размещена на:', x, y);
  updateMarkerStatus();
}

function removeTempMarker(type) {
  if (tempMarkers[type] && tempMarkers[type].overlay) {
    map.removeOverlay(tempMarkers[type].overlay);
    tempMarkers[type] = null;
    console.log('Временная метка ' + type + ' удалена');
  }
}

function getTempMarkerPosition(type) {
  if (tempMarkers[type]) {
    return tempMarkers[type].position;
  }
  return null;
}

function resetPlacementState() {
  stopPlacementMode();
  removeTempMarker('resource');
  removeTempMarker('shelter');
  
  var resourceCheck = document.getElementById('resource-check');
  var shelterCheck = document.getElementById('shelter-check');
  if (resourceCheck) resourceCheck.checked = false;
  if (shelterCheck) shelterCheck.checked = false;
  
  updateMarkerStatus();
}

// ============================================================
// ОТПРАВКА ОТЧЁТА С ПРОВЕРКОЙ ДУБЛИКАТОВ
// ============================================================

async function submitReportHandler() {
  console.log('Отправка отчёта...');
  
  if (!isAuthorized) {
    alert('Сначала введите пароль!');
    return;
  }
  
  if (!currentRegionId) {
    alert('Регион не выбран!');
    return;
  }
  
  var content = document.getElementById('report-content')?.value.trim();
  if (!content) {
    alert('Напишите текст отчёта');
    return;
  }

  var deceasedInputs = document.querySelectorAll('.deceased-name');
  var deceasedNames = [];
  deceasedInputs.forEach(function(input) {
    var name = input.value.trim();
    if (name) deceasedNames.push(name);
  });

  var hasResource = document.getElementById('resource-check')?.checked || false;
  var hasShelter = document.getElementById('shelter-check')?.checked || false;

  if (!hasResource && !hasShelter && deceasedNames.length === 0) {
    alert('Добавьте хотя бы одно имя умершего или отметьте точку интереса');
    return;
  }

  if (hasResource && !tempMarkers.resource) {
    alert('Кликните на карту, чтобы разместить метку для "Место ресурса"');
    return;
  }
  
  if (hasShelter && !tempMarkers.shelter) {
    alert('Кликните на карту, чтобы разместить метку для "Место ночлега"');
    return;
  }

  var keeperName = getCurrentKeeper();

  try {
    // Проверяем имена на дубликаты
    var uniqueDeceasedNames = [];
    var existingNames = [];
    
    for (var d = 0; d < deceasedNames.length; d++) {
      var name = deceasedNames[d];
      if (!name) continue;
      
      // Проверяем, есть ли уже такое имя в базе
      var checkResult = await _supabase
        .from('game_reports')
        .select('id')
        .contains('deceased_names', [name])
        .limit(1);
      
      if (checkResult.error) {
        console.error('Ошибка проверки имени:', checkResult.error);
        continue;
      }
      
      if (checkResult.data && checkResult.data.length > 0) {
        existingNames.push(name);
        console.log('Имя "' + name + '" уже существует в базе, пропускаем');
      } else {
        uniqueDeceasedNames.push(name);
      }
    }
    
    if (existingNames.length > 0) {
      alert('Следующие имена уже есть в базе и не будут добавлены повторно: ' + existingNames.join(', '));
    }
    
    // Если после проверки не осталось имён и нет точек интереса
    if (uniqueDeceasedNames.length === 0 && !hasResource && !hasShelter) {
      alert('Нет новых данных для сохранения');
      return;
    }

    var regionResult = await _supabase
      .from('regions')
      .select('x, y')
      .eq('id', currentRegionId)
      .single();
    
    if (regionResult.error) {
      console.error('Ошибка получения координат региона:', regionResult.error);
      alert('Не удалось получить координаты региона');
      return;
    }
    
    var reportsToInsert = [];
    
    // Если есть уникальные имена, создаём отчёт
    if (uniqueDeceasedNames.length > 0) {
      reportsToInsert.push({
        region_id: currentRegionId,
        keeper_name: keeperName || null,
        content: content,
        deceased_names: uniqueDeceasedNames,
        has_resource: hasResource || false,
        has_shelter: hasShelter || false,
        marker_type: null,
        marker_x: null,
        marker_y: null,
        game_date: new Date().toISOString().split('T')[0]
      });
    }
    
    // Если выбран ресурс, создаём отдельный отчёт с меткой
    if (hasResource && tempMarkers.resource) {
      var pos = tempMarkers.resource.position;
      // Если уже есть отчёт с именами, добавляем к нему метку
      if (reportsToInsert.length > 0 && uniqueDeceasedNames.length > 0) {
        reportsToInsert[0].has_resource = true;
        reportsToInsert[0].marker_type = 'resource';
        reportsToInsert[0].marker_x = pos.x;
        reportsToInsert[0].marker_y = pos.y;
      } else {
        reportsToInsert.push({
          region_id: currentRegionId,
          keeper_name: keeperName || null,
          content: content + ' (Место ресурса)',
          deceased_names: uniqueDeceasedNames.length > 0 ? uniqueDeceasedNames : null,
          has_resource: true,
          has_shelter: false,
          marker_type: 'resource',
          marker_x: pos.x,
          marker_y: pos.y,
          game_date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    // Если выбран ночлег, создаём отдельный отчёт с меткой
    if (hasShelter && tempMarkers.shelter) {
      var pos2 = tempMarkers.shelter.position;
      // Если уже есть отчёт с именами и ещё нет ресурса, добавляем к нему метку
      if (reportsToInsert.length > 0 && uniqueDeceasedNames.length > 0 && !hasResource) {
        reportsToInsert[0].has_shelter = true;
        reportsToInsert[0].marker_type = 'shelter';
        reportsToInsert[0].marker_x = pos2.x;
        reportsToInsert[0].marker_y = pos2.y;
      } else {
        reportsToInsert.push({
          region_id: currentRegionId,
          keeper_name: keeperName || null,
          content: content + ' (Место ночлега)',
          deceased_names: uniqueDeceasedNames.length > 0 ? uniqueDeceasedNames : null,
          has_resource: false,
          has_shelter: true,
          marker_type: 'shelter',
          marker_x: pos2.x,
          marker_y: pos2.y,
          game_date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    // Вставляем все отчёты
    var allResults = [];
    for (var i = 0; i < reportsToInsert.length; i++) {
      var result = await _supabase
        .from('game_reports')
        .insert([reportsToInsert[i]]);
      
      if (result.error) {
        console.error('Ошибка отправки отчёта:', result.error);
        alert('Ошибка: ' + result.error.message);
        return;
      }
      allResults.push(result);
    }

    var message = 'Отчёт сохранён!';
    if (uniqueDeceasedNames.length > 0) {
      message += ' Добавлено имён: ' + uniqueDeceasedNames.length;
    }
    if (hasResource) message += ' (ресурс)';
    if (hasShelter) message += ' (ночлег)';
    alert(message);
    
    document.getElementById('report-content').value = '';
    document.getElementById('deceased-container').innerHTML = '';
    document.getElementById('resource-check').checked = false;
    document.getElementById('shelter-check').checked = false;
    addDeceasedField();
    
    resetPlacementState();
    
    await loadReports(currentRegionId);
    
    if (typeof loadReportMarkers === 'function') {
      await loadReportMarkers();
    }
    
  } catch (err) {
    console.error('Критическая ошибка:', err);
    alert('Ошибка: ' + err.message);
  }
}

function resetAuthorization() {
  if (confirm('Вы уверены, что хотите сменить Хранителя узлов? Текущий сеанс будет завершён.')) {
    setReportAuthorized(false);
    setCurrentKeeper('');
    updateReportButton();
    updateKeeperDisplay();
    updateReportSectionVisibility();
    resetPlacementState();
    
    var section = document.getElementById('report-section');
    if (section) {
      section.style.display = 'none';
    }
    
    var reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.textContent = 'Введите пароль для создания отчёта';
      reportBtn.style.opacity = '0.6';
      reportBtn.style.cursor = 'pointer';
      reportBtn.onclick = function() {
        openPasswordModal();
      };
    }
    
    console.log('Авторизация сброшена');
  }
}

function updateReportButton() {
  var reportBtn = document.getElementById('report-btn');
  if (!reportBtn) return;
  
  if (isAuthorized) {
    var keeper = getCurrentKeeper();
    reportBtn.textContent = keeper ? 'Составить отчёт (' + keeper + ')' : 'Составить отчёт';
    reportBtn.style.opacity = '1';
    reportBtn.style.cursor = 'pointer';
    reportBtn.onclick = null;
    updateReportSectionVisibility();
    
    var changeBtn = document.getElementById('change-keeper-btn');
    if (!changeBtn) {
      var btn = document.createElement('button');
      btn.id = 'change-keeper-btn';
      btn.textContent = 'Сменить Хранителя';
      btn.style.cssText = 'width: 100%; padding: 6px; margin-top: 6px; background: rgba(74,14,14,0.3); border: 1px solid rgba(74,14,14,0.3); border-radius: 4px; color: rgba(255,255,255,0.5); cursor: pointer; font-family: "Philosopher", sans-serif; font-size: 12px; transition: all 0.3s;';
      btn.onmouseover = function() { this.style.background = 'rgba(74,14,14,0.6)'; this.style.color = '#ffffff'; };
      btn.onmouseout = function() { this.style.background = 'rgba(74,14,14,0.3)'; this.style.color = 'rgba(255,255,255,0.5)'; };
      btn.onclick = resetAuthorization;
      reportBtn.parentNode.insertBefore(btn, reportBtn.nextSibling);
    }
  } else {
    reportBtn.textContent = 'Введите пароль для создания отчёта';
    reportBtn.style.opacity = '0.6';
    reportBtn.style.cursor = 'pointer';
    reportBtn.onclick = function() {
      openPasswordModal();
    };
    updateReportSectionVisibility();
    resetPlacementState();
    
    var changeBtn = document.getElementById('change-keeper-btn');
    if (changeBtn) {
      changeBtn.remove();
    }
  }
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ПАРОЛЯ
// ============================================================

var passwordModal = document.createElement('div');
passwordModal.id = 'password-modal';
passwordModal.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  justify-content: center;
  align-items: center;
`;
passwordModal.innerHTML = `
  <div style="background: #1a0a1a; border: 1px solid #4a0e0e; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; color: #ffffff; box-shadow: 0 8px 40px rgba(0,0,0,0.8);">
    <h3 style="font-family: "Calypso", serif; color: #ffd700; text-align: center; margin-top: 0; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px;">Введите пароль</h3>
    <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 16px;">Введите пароль для доступа к созданию отчётов</p>
    <input id="password-input" type="password" placeholder="Введите пароль..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 16px;">
    <input id="keeper-input" type="text" placeholder="Имя Хранителя узлов..." style="width: 100%; padding: 10px; margin-bottom: 12px; background: rgba(255,255,255,0.05); border: 1px solid #4a0e0e; border-radius: 6px; color: #ffffff; font-family: "Philosopher", sans-serif; box-sizing: border-box; font-size: 16px;">
    <div style="display: flex; gap: 10px;">
      <button id="password-submit-btn" style="flex: 1; padding: 10px; background: #4a0e0e; color: #ffd700; border: none; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif; font-weight: bold; transition: all 0.3s;">Подтвердить</button>
      <button id="password-cancel-btn" style="padding: 10px 20px; background: transparent; color: #888; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-family: "Philosopher", sans-serif;">Отмена</button>
    </div>
    <div id="password-error" style="color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 8px; display: none;"></div>
  </div>
`;
document.body.appendChild(passwordModal);

var passwordInput = document.getElementById('password-input');
var keeperInput = document.getElementById('keeper-input');
var passwordSubmitBtn = document.getElementById('password-submit-btn');
var passwordCancelBtn = document.getElementById('password-cancel-btn');
var passwordError = document.getElementById('password-error');

function openPasswordModal() {
  passwordInput.value = '';
  keeperInput.value = '';
  passwordError.style.display = 'none';
  passwordModal.style.display = 'flex';
  setTimeout(function() { passwordInput.focus(); }, 100);
}

function closePasswordModal() {
  passwordModal.style.display = 'none';
}

passwordSubmitBtn.addEventListener('click', function() {
  var inputPassword = passwordInput.value.trim();
  var keeperName = keeperInput.value.trim();

  if (!inputPassword) {
    passwordError.textContent = 'Введите пароль';
    passwordError.style.display = 'block';
    return;
  }

  if (!keeperName) {
    passwordError.textContent = 'Введите имя Хранителя узлов';
    passwordError.style.display = 'block';
    return;
  }

  if (inputPassword === REPORT_PASSWORD) {
    setReportAuthorized(true);
    setCurrentKeeper(keeperName);
    closePasswordModal();
    updateReportButton();
    updateKeeperDisplay();
    updateReportSectionVisibility();
    
    var section = document.getElementById('report-section');
    if (section) {
      section.style.display = 'block';
    }
  } else {
    passwordError.textContent = 'Неверный пароль';
    passwordError.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }
});

passwordCancelBtn.addEventListener('click', closePasswordModal);
passwordModal.addEventListener('click', function(e) {
  if (e.target === this) closePasswordModal();
});

passwordInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') keeperInput.focus();
});
keeperInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') passwordSubmitBtn.click();
});

loadAuthState();

if (isAuthorized) {
  document.addEventListener('DOMContentLoaded', function() {
    updateReportButton();
    updateKeeperDisplay();
    updateReportSectionVisibility();
    
    var section = document.getElementById('report-section');
    if (section) {
      section.style.display = 'block';
    }
  });
}

// ============================================================
// ЗАКРЫТИЕ ПРИ КЛИКЕ НА КАРТУ
// ============================================================

function closeSidebarOnMapClick() {
  if (typeof map !== 'undefined') {
    map.on('click', function(event) {
      if (placementMode) {
        return;
      }
      
      var target = event.originalEvent.target;
      var isOverlay = target.closest('.ol-overlay-container') !== null;
      
      if (!isOverlay) {
        var sidebarEl = document.getElementById('region-sidebar');
        if (sidebarEl && sidebarEl.style.display === 'block') {
          closeSidebar();
        }
      }
    });
  }
}

setTimeout(closeSidebarOnMapClick, 1000);
