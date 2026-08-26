// ============================================================
// КОНФИГУРАЦИЯ SUPABASE
// ============================================================

const SUPABASE_URL = 'https://djieimjwhgjgsjcysceh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';

const { createClient } = supabase;
export const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase подключён (модуль)');

// ============================================================
// КОНФИГУРАЦИЯ ПАРОЛЯ ДЛЯ ОТЧЁТОВ
// ============================================================

// Пароль для доступа к созданию отчётов (меняй на свой)
export const REPORT_PASSWORD = 'CHERTOGI2024';

// Состояние авторизации для отчётов
let reportAuthorized = false;

export function isReportAuthorized() {
  return reportAuthorized;
}

export function setReportAuthorized(value) {
  reportAuthorized = value;
  console.log('🔑 Статус доступа к отчётам:', reportAuthorized ? '✅ Открыт' : '🔒 Закрыт');
}
