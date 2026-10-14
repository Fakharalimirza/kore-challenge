export function emailConfig(env: any) {
  const key = String(env?.RESEND_API_KEY || '');
  const from = String(env?.EMAIL_FROM || '');
  const base = String(env?.APP_URL || '').replace(/\/$/, '');
  if (!key || !from) return null;
  return { key, from, base };
}

export async function sendEmail(
  env: any,
  to: string | string[],
  subject: string,
  html: string,
): Promise<{ status: 'sent' | 'skipped' | 'failed'; detail: string }> {
  const cfg = emailConfig(env);
  const list = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!cfg)
    return {
      status: 'skipped',
      detail: 'Email not configured (RESEND_API_KEY/EMAIL_FROM).',
    };
  if (!list.length) return { status: 'skipped', detail: 'No recipient.' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: cfg.from, to: list, subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) return { status: 'sent', detail: '' };
    let detail = '';
    try {
      detail = JSON.stringify(await r.json()).slice(0, 300);
    } catch {}
    return { status: 'failed', detail: detail || `Resend error ${r.status}` };
  } catch (e: any) {
    return { status: 'failed', detail: String(e?.message || e).slice(0, 200) };
  }
}

const esc = (v: any) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const qrUrl = (ref: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ref)}`;

const shell = (preheader: string, body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f9;padding:24px 12px"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden"><tr><td style="background:#087f70;color:#ffffff;padding:20px 28px;font-size:22px;font-weight:800;letter-spacing:-0.5px">◎ Kore challenge</td></tr><tr><td style="padding:28px;color:#172b34;font-size:14px;line-height:1.6">${body}</td></tr><tr><td style="padding:16px 28px;color:#849294;font-size:11px;border-top:1px solid #e4e8ec">Kore challenge · Onplan Real Estate & Imtiaz · Keep this email until the event is over.</td></tr></table></td></tr></table></div>`;

const refBox = (ref: string) =>
  `<p style="font-size:13px;color:#75818a;margin:20px 0 6px">YOUR REFERENCE NUMBER</p><p style="font-size:32px;font-weight:800;color:#087f70;background:#e9f5f1;border:1px dashed #087f70;border-radius:10px;padding:12px;text-align:center;margin:0 0 20px">${esc(ref)}</p>`;

const qrBlock = (ref: string, caption: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td align="center"><img src="${qrUrl(ref)}" width="200" height="200" alt="QR code ${esc(ref)}" style="display:block;border:1px solid #e4e8ec;border-radius:8px"/><p style="font-size:12px;color:#75818a;margin:8px 0 0">${caption} Coaches scan this at each station.</p></td></tr></table>`;

const brandRow = (base: string) =>
  base
    ? `<p><img src="${base}/Onplan%20logo.png" alt="Onplan Real Estate" height="30" style="vertical-align:middle;margin-right:12px"/><img src="${base}/Imtiaz%20logo.svg" alt="Imtiaz" height="26" style="vertical-align:middle"/></p>`
    : '';

const pills = (items: string[]) =>
  items.length
    ? `<p>${items.map((a) => `<span style="display:inline-block;background:#e9f5f1;color:#087f70;border-radius:20px;padding:4px 12px;margin:0 6px 6px 0;font-size:13px;font-weight:600">${esc(a)}</span>`).join('')}</p>`
    : '';

const creds = (
  base: string,
  email: string,
  password: string | null,
  path: string,
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;border-radius:8px;margin:16px 0"><tr><td style="padding:14px 18px;font-size:13px">Sign in at: ${base ? `<a href="${base}${path}" style="color:#087f70;font-weight:700">${esc(base)}${path}</a>` : `<b>${path}</b>`}<br/>Email: <b>${esc(email)}</b>${password ? `<br/>Password: <b>${esc(password)}</b>` : '<br/>Use the password set for you by the event owner.'}</td></tr></table>`;

export const mailParticipant = (
  base: string,
  name: string,
  ref: string,
  activities: string[],
) => ({
  subject: `You're registered! Ref ${ref} — Kore challenge`,
  html: shell(
    `You're registered for Kore challenge. Reference ${ref}.`,
    `${brandRow(base)}<h1 style="font-size:24px;margin:0 0 8px">You're in, ${esc(name)}!</h1><p>You're registered for Kore challenge as an individual. Show this reference number and QR code at the venue and every activity station.</p>${refBox(ref)}${qrBlock(ref, 'Your personal QR code.')}<p style="font-weight:700;margin:0 0 4px">Your activities</p>${pills(activities)}${base ? `<p>Someone else still needs to register? Send them here: <a href="${base}/register" style="color:#087f70;font-weight:700">${esc(base)}/register</a></p>` : ''}`,
  ),
});

export const mailTeamMember = (
  base: string,
  name: string,
  memberRef: string,
  team: string,
  ref: string,
  activities: string[],
  mates: string[],
) => ({
  subject: `You've been added to team ${team} (${ref})`,
  html: shell(
    `You've been added to team ${team}. Team reference ${ref}.`,
    `<h1 style="font-size:24px;margin:0 0 8px">Team update, ${esc(name)}!</h1><p>You've been added to team <b>${esc(team)}</b>. Show this team QR code at team activity stations.</p>${brandRow(base)}${refBox(ref)}${qrBlock(ref, 'Team QR code.')}<p style="font-weight:700;margin:0 0 4px">Team activities</p>${pills(activities)}<p><b>Members:</b> ${esc(mates.join(', '))}</p><p style="font-size:13px;color:#75818a">Your individual reference number is <b>${esc(memberRef)}</b> — use it at individual stations.</p>`,
  ),
});

export const mailCoach = (
  base: string,
  email: string,
  name: string,
  activities: string[],
  password: string | null,
) => ({
  subject: `Coach access — Kore challenge`,
  html: shell(
    `You've been given coach access for Kore challenge.`,
    `${brandRow(base)}<h1 style="font-size:24px;margin:0 0 8px">Coach access${name ? ` — ${esc(name)}` : ''}</h1><p>You've been given coach access${activities.length ? ' for these stations' : ''}. Find participants by name, email, phone, or reference number — or scan the QR on their slip.</p>${pills(activities)}${creds(base, email, password, '/staff-login')}`,
  ),
});

export const mailAdmin = (
  base: string,
  email: string,
  name: string,
  password: string | null,
) => ({
  subject: `Admin access — Kore challenge`,
  html: shell(
    `You've been given admin access to the Kore challenge event desk.`,
    `${brandRow(base)}<h1 style="font-size:24px;margin:0 0 8px">Admin access${name ? ` — ${esc(name)}` : ''}</h1><p>You can manage registrations, teams, result approvals, coaches, and event setup.</p>${creds(base, email, password, '/staff-login')}`,
  ),
});
