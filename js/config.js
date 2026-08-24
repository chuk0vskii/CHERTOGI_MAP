// ===== КОНФИГУРАЦИЯ SUPABASE =====
const SUPABASE_URL = 'https://djieimjwhgjgsjcysceh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_R2gXWQPVT5trC7cL2BDIpw_Av1QHxDi';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase подключён');
