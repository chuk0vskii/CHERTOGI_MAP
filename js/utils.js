// ============================================================
// ЭКРАНИРОВАНИЕ HTML (ЗАЩИТА ОТ XSS)
// ============================================================

/**
 * Экранирует HTML-символы, чтобы предотвратить XSS-атаки.
 * Используй ВСЕГДА, когда вставляешь пользовательский текст через innerHTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Безопасно вставляет текст в элемент (без HTML).
 */
function setTextSafe(element, text) {
  if (!element) return;
  element.textContent = text ?? '';
}

// Экспорт для использования в других файлах (если модульная система)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHtml, setTextSafe };
}
