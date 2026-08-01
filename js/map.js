function renderMap() {
  const grid = document.getElementById('hex-grid');
  grid.innerHTML = '';

  // ===== НОВАЯ СХЕМА: 8 СТОЛБЦОВ =====
  const columns = [
    ['0.1', '0.2', '0', '0.3', '0.4'],  // Колонка 1 (5 гексов)
    ['1', '2', '3', '4'],                // Колонка 2 (4 гекса)
    ['5', '6', '7', '8'],                // Колонка 3 (4 гекса)
    ['9', '10', '11', '12', '13'],       // Колонка 4 (5 гексов)
    ['14', '15', '16', '17'],            // Колонка 5 (4 гекса)
    ['18', '19', '20', '21'],            // Колонка 6 (4 гекса)
    ['22', '23', '24'],                  // Колонка 7 (3 гекса)
    ['25', '26', '27']                   // Колонка 8 (3 гекса)
  ];

  // Создаем контейнер для столбцов
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'columns-container';

  columns.forEach((column, colIndex) => {
    const colDiv = document.createElement('div');
    colDiv.className = `column column-${colIndex + 1}`;
    
    column.forEach(hexId => {
      const hexElement = createHexElement(hexId);
      colDiv.appendChild(hexElement);
    });
    
    columnsContainer.appendChild(colDiv);
  });

  grid.appendChild(columnsContainer);

  // Прогресс
  const total = Object.keys(hexData).length;
  const unlocked = Object.values(hexData).filter(h => h.unlocked).length;
  const p = document.getElementById('progress');
  if (p) p.textContent = `📊 Прогресс: ${unlocked}/${total} (${Math.round(unlocked/total*100)}%)`;
}
