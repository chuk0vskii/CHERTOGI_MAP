const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    // Supabase Webhook передает тип события в payload.type (INSERT или UPDATE)
    const eventType = payload.type; 
    const record = payload.record;

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ error: 'Missing Telegram secrets' }), { status: 500 });
    }

    let reportText = record.content || 'Текст отсутствует';
    const MAX_LENGTH = 3500; 
    
    if (reportText.length > MAX_LENGTH) {
      reportText = reportText.substring(0, MAX_LENGTH) + '...\n\n⚠️ [Текст слишком длинный. Полный текст смотрите на сайте!]';
    }

    // Определяем заголовок
    let title = '📝 *Новый отчёт на модерацию!*';
    if (eventType === 'UPDATE') {
      title = '✏️ *Запрос на редактирование отчёта!*';
    }

    const text = `${title}\n\n` +
                 `👤 *Хранитель:* ${record.keeper_name || 'Не указан'}\n` +
                 `📍 *Регион ID:* ${record.region_id}\n` +
                 `💬 *Текст:*\n${reportText}`;

    // Отправляем в Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Одобрить', callback_data: `approve:${record.id}` },
              { text: '❌ Отклонить', callback_data: `reject:${record.id}` }
            ]
          ]
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Telegram error:', errText);
      return new Response(JSON.stringify({ error: 'Telegram API failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
