// ============================================================
// КОНФИГУРАЦИЯ SUPABASE
// ============================================================

const SUPABASE_URL = 'https://djieimjwhgjgsjcysceh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';

const { createClient } = supabase;
export const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase подключён (модуль)');

// ============================================================
// ПРОСТОЙ ПАРОЛЬ ДЛЯ ДОСТУПА
// ============================================================

export const REPORT_PASSWORD = 'CHERTOGI2024';

let isAuthorized = false;
let currentKeeper = '';

export function isReportAuthorized() {
  return isAuthorized;
}

export function setReportAuthorized(value) {
  isAuthorized = value;
  console.log('🔑 Статус доступа к отчётам:', isAuthorized ? '✅ Открыт' : '🔒 Закрыт');
}

export function getCurrentKeeper() {
  return currentKeeper;
}

export function setCurrentKeeper(name) {
  currentKeeper = name;
}
