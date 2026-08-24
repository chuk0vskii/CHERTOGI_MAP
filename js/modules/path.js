export async function rollTable(tableName, containerId) {
  console.log(`🎲 rollTable вызван: tableName="${tableName}", containerId="${containerId}"`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Контейнер не найден: ${containerId}`);
    return;
  }
  
  const data = await getTableData(tableName);
  
  if (!data || data.length === 0) {
    container.innerHTML = `<div style="color: #ff6b6b; padding: 8px 12px; background: rgba(255,107,107,0.1); border-radius: 6px; border-left: 2px solid #ff6b6b;">
      ❌ Нет данных в таблице "${tableName}"
    </div>`;
    container.style.display = 'block';
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  const item = data[randomIndex];
  
  console.log(`🎯 Выбрана запись #${randomIndex + 1}:`, item);
  
  let html = `<div style="background: rgba(255,215,0,0.05); padding: 10px 14px; border-radius: 6px; border-left: 2px solid #ffd700; margin-top: 6px;">`;
  html += `<div style="color: #ffd700; font-size: 13px; margin-bottom: 4px;">🎲 Результат броска: <strong>${randomIndex + 1}</strong></div>`;
  
  // Выводим name (жирным)
  if (item.name) {
    html += `<div style="font-size: 15px; color: #ffffff; font-weight: bold; margin-bottom: 4px;">${item.name}</div>`;
  }
  
  // Выводим description
  if (item.description) {
    html += `<div style="font-size: 14px; color: #e0d5c0; line-height: 1.5;">${item.description}</div>`;
  }
  
  html += `</div>`;
  container.innerHTML = html;
  container.style.display = 'block';
}
