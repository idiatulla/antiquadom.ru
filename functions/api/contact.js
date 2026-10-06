// Cloudflare Pages Function: POST /api/contact -> email via Resend API.
// Environment variables (Pages -> Settings -> Variables and Secrets):
//   RESEND_API_KEY  (secret)  API key from resend.com
//   MAIL_TO         recipient(s), comma-separated, e.g. info@antiquadom.ru
//   MAIL_FROM       verified sender, e.g. "Сайт antiquadom.ru <noreply@antiquadom.ru>"

const MAX = { name: 200, phone: 50, message: 5000 };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'Forbidden' }, 403);

  let data;
  try { data = await request.json(); } catch { return json({ error: 'Некорректный запрос.' }, 400); }
  if (!data || typeof data !== 'object') return json({ error: 'Некорректный запрос.' }, 400);

  // honeypot: bots fill the hidden field; pretend success
  if (data.website) return json({ ok: true });

  const f = {};
  for (const [k, max] of Object.entries(MAX)) f[k] = String(data[k] ?? '').trim().slice(0, max);

  if (!f.name) return json({ error: 'Укажите, как вас зовут.' }, 400);
  if (f.phone.replace(/\D/g, '').length < 5) return json({ error: 'Укажите телефон для связи.' }, 400);

  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) return json({ error: 'Почтовый сервис не настроен.' }, 500);

  const rows = [['Имя', f.name], ['Телефон', f.phone], ['Сообщение', f.message]].filter(([, v]) => v);

  const html = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif">' +
    rows.map(([k, v]) => `<tr><td style="border:1px solid #ddd;background:#f6f6f6"><b>${esc(k)}</b></td><td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`).join('') + '</table>';
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: env.MAIL_TO.split(',').map(s => s.trim()).filter(Boolean),
      subject: `Заявка с сайта antiquadom.ru — ${f.name}`,
      html, text,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.' }, 502);
  }
  return json({ ok: true });
}

export const onRequest = () => json({ error: 'Method not allowed' }, 405);
