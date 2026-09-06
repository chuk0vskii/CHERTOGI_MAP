export default {
  id: 1,
  title: 'Знаменье Темной Нити',
  description: 'От судьбы не уйдет никто. Ведь началась Темная Нить и она тянет искателей за собой. Группу ожидает их предназначение.',
  checkInfo: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы.',
  type: 'simple',
  
  render: function(event, helpers) {
    return ''; // Простое событие без дополнительных элементов
  },
  
  handleCheck: function(event, values, type) {
    return null; // Нет проверки
  }
};
