// ============================================================
// ЗАГРУЗКА И ОТПРАВКА ОТЧЁТОВ
// ============================================================

import { _supabase } from '../config-module.js';
import { REPORT_PASSWORD, isReportAuthorized, setReportAuthorized } from '../config-module.js';

// ============================================================
// ЗАГРУЗКА ОТЧЁТОВ
// ============================================================

export async function loadReports(regionId) {
  const reportsList = document.getElementById('reports-list');
  if (!reportsList) return;
  
  reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">Загрузка...</p>';
  
  const { data, error } = await _supabase
    .from('game_reports')
    .select('*')
    .eq('region_id', regionId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Ошибка загрузки отчётов:', error);
    reportsList.innerHTML = '<p style="color: #ff6b6b; font-size: 14px;">❌ Ошибка загрузки</p>';
    return;
  }

  if (!data || data.length === 0) {
    reportsList.innerHTML = '<p style="color: #777; font-size: 14px;">📭 Пока нет отчётов для этого региона</p>';
    return;
  }

  reportsList.innerHTML = data.map(report => `
    <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border-left: 3px solid rgba(255, 215, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="color: #aaa; font-size: 11px;">🗓️ ${new Date(report.created_at).toLocaleDateString('ru-RU')} · 👤 ${report.user_name || 'Аноним'}</span>
        <span style="color: #555; font-size: 10px;">#${report.id}</span>
      </div>
      <div style="color: #e0d5c0; font-size: 14px; line-height: 1.4; word-wrap: break-word;">${report.content}</div>
    </div>
  `).join('');
}

// ============================================================
// ОТПРАВКА ОТЧЁТА (с проверкой пароля)
// ============================================================

export async function submitReport(regionId, content, authorName) {
  // Проверяем, авторизован ли пользователь
  if (!isReportAuthorized()) {
    return { success: false, error: 'Введите пароль для доступа к отчётам' };
  }

  const { data, error } = await _supabase
    .from('game_reports')
    .insert([{
      region_id: regionId,
      user_name: authorName || 'Аноним',
      content: content,
      game_date: new Date().toISOString().split('T')[0]
    }]);

  if (error) {
    console.error('❌ Ошибка отправки отчёта:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data };
}

// ============================================================
// ПРОВЕРКА ПАРОЛЯ
// ============================================================

export function checkPassword(inputPassword) {
  if (inputPassword === REPORT_PASSWORD) {
    setReportAuthorized(true);
    return { success: true };
  } else {
    return { success: false, error: 'Неверный пароль' };
  }
}
