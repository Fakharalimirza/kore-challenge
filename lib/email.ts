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
  text?: string,
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
      body: JSON.stringify({
        from: cfg.from,
        to: list,
        subject,
        html,
        ...(text ? { text } : {}),
      }),
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

const logos = (base: string) =>
  base
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px"><tr><td align="left" width="50%" style="vertical-align:middle"><img src="${base}/Onplan%20logo%20black.png" alt="Onplan Real Estate" height="48" style="display:inline-block"/></td><td align="right" width="50%" style="vertical-align:middle"><img src="${base}/Imtiaz%20logo.svg" alt="Imtiaz" height="48" style="display:inline-block"/></td></tr></table>`
    : '';

const shell = (preheader: string, body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;background:#e9efef;padding:24px 10px"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">` +
  `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">` +
  `<tr><td style="background:#8c2e47;color:#ffffff;padding:22px 30px"><div style="font-size:22px;font-weight:800">◎ Kore fitness challenge</div><div style="font-size:11px;letter-spacing:2px;opacity:0.85;margin-top:4px">ONPLAN REAL ESTATE | IMTIAZ</div></td></tr>` +
  `<tr><td style="padding:30px;color:#172b34;font-size:14px;line-height:1.65">${body}</td></tr>` +
  `<tr><td style="padding:18px 30px;color:#849294;font-size:11px;line-height:1.6;border-top:1px solid #e4e8ec">Kore fitness challenge · Organized by Onplan Real Estate | Imtiaz<br/>Keep this email until the event is over. Your reference number and QR code are checked at every station.</td></tr>` +
  `</table></td></tr></table></div>`;

const refCard = (ref: string, label: string) =>
  `<p style="font-size:12px;color:#75818a;margin:22px 0 6px;letter-spacing:1px">${label}</p>` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr><td align="center" style="font-size:32px;font-weight:800;color:#8c2e47;background:#fff6d6;border:1px dashed #8c2e47;border-radius:10px;padding:14px">${esc(ref)}</td></tr></table>`;

const qrBlock = (ref: string, caption: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr><td align="center"><img src="${qrUrl(ref)}" width="200" height="200" alt="QR code ${esc(ref)}" style="display:block;border:1px solid #e4e8ec;border-radius:8px"/><p style="font-size:12px;color:#75818a;margin:10px 0 0">${caption} Coaches scan this at each station. If the image doesn't load, your reference number above works the same.</p></td></tr></table>`;

const details = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border:1px solid #e4e8ec;border-radius:8px">` +
  rows
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:10px 16px;font-size:13px;color:#75818a;width:38%;${i ? 'border-top:1px solid #eef2f2;' : ''}">${esc(k)}</td><td style="padding:10px 16px;font-size:13px;font-weight:700;color:#172b34;${i ? 'border-top:1px solid #eef2f2;' : ''}">${v}</td></tr>`,
    )
    .join('') +
  `</table>`;

const pills = (items: string[]) =>
  items.length
    ? `<p>${items.map((a) => `<span style="display:inline-block;background:#fff6d6;color:#8c2e47;border-radius:20px;padding:4px 12px;margin:0 6px 6px 0;font-size:13px;font-weight:600">${esc(a)}</span>`).join('')}</p>`
    : '';

const button = (base: string, path: string, label: string) =>
  base
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr><td align="center" bgcolor="#ffce00" style="border-radius:8px"><a href="${base}${path}" style="display:inline-block;padding:13px 30px;color:#2a2000;font-size:14px;font-weight:700;text-decoration:none">${esc(label)}</a></td></tr></table>`
    : '';

const creds = (
  base: string,
  email: string,
  password: string | null,
  path: string,
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;border-radius:8px;margin:0 0 22px"><tr><td style="padding:14px 18px;font-size:13px;line-height:1.7">Sign in at: ${base ? `<a href="${base}${path}" style="color:#8c2e47;font-weight:700">${esc(base)}${path}</a>` : `<b>${path}</b>`}<br/>Email: <b>${esc(email)}</b>${password ? `<br/>Password: <b>${esc(password)}</b>` : '<br/>Use the password set for you by the event owner.'}</td></tr></table>`;

const h1 = (t: string) =>
  `<h1 style="font-size:24px;margin:0 0 10px;color:#161616">${t}</h1>`;

export const mailParticipant = (
  base: string,
  name: string,
  ref: string,
  activities: string[],
  extra?: { email?: string; phone?: string; age?: any; gender?: string; org?: string },
) => {
  const rows: [string, string][] = [
    ['Name', esc(name)],
    ['Reference', esc(ref)],
  ];
  if (extra?.gender) rows.push(['Gender', esc(extra.gender)]);
  if (extra?.age != null && extra.age !== '') rows.push(['Age', esc(extra.age)]);
  if (extra?.org) rows.push(['Organization', esc(extra.org)]);
  if (extra?.email) rows.push(['Email', esc(extra.email)]);
  if (extra?.phone) rows.push(['Phone', esc(extra.phone)]);
  return {
    subject: `You're registered! Ref ${ref} — Kore fitness challenge`,
    html: shell(
      `You're registered for Kore fitness challenge. Reference ${ref}.`,
      `${logos(base) ? `<p>${logos(base)}</p>` : ''}${h1(`You're in, ${esc(name)}!`)}` +
        `<p>You're registered for Kore fitness challenge as an individual. Show this reference number and QR code at the venue and every activity station.</p>` +
        refCard(ref, 'YOUR REFERENCE NUMBER') +
        qrBlock(ref, 'Your personal QR code.') +
        details(rows) +
        button(base, '/register', 'Register someone else') +
        (base
          ? `<p style="font-size:13px;color:#75818a">Someone else still needs to register? Send them here: <a href="${base}/register" style="color:#8c2e47;font-weight:700">${esc(base)}/register</a></p>`
          : ''),
    ),
    text:
      `You're in, ${name}!\nYou're registered for Kore fitness challenge as an individual.\nReference number: ${ref}\n` +
      (extra?.gender ? `Gender: ${extra.gender}\n` : '') +
      (extra?.age != null && extra.age !== '' ? `Age: ${extra.age}\n` : '') +
      (extra?.org ? `Organization: ${extra.org}\n` : '') +
      `Show this reference number at the venue and every activity station.`,
  };
};

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
    `${logos(base) ? `<p>${logos(base)}</p>` : ''}${h1(`Team update, ${esc(name)}!`)}` +
      `<p>You've been added to team <b>${esc(team)}</b>. Show this team QR code at team activity stations.</p>` +
      refCard(ref, 'TEAM REFERENCE NUMBER') +
      qrBlock(ref, 'Team QR code.') +
      details([
        ['Team', esc(team)],
        ['Team reference', esc(ref)],
        ['Members', esc(mates.join(', '))],
        ['Your individual ref', esc(memberRef)],
      ]) +
      `<p style="font-weight:700;margin:0 0 4px">Team activities</p>${pills(activities)}` +
      `<p style="font-size:13px;color:#75818a">Use your individual reference (<b>${esc(memberRef)}</b>) at individual stations.</p>`,
  ),
  text:
    `Team update, ${name}!\nYou've been added to team ${team}.\nTeam reference: ${ref}\nMembers: ${mates.join(', ')}\nTeam activities: ${activities.join(', ') || '—'}\nYour individual reference: ${memberRef} (use it at individual stations).`,
});

export const mailCoach = (
  base: string,
  email: string,
  name: string,
  activities: string[],
  password: string | null,
) => ({
  subject: `Coach access — Kore fitness challenge`,
  html: shell(
    `You've been given coach access for Kore fitness challenge.`,
    `${logos(base) ? `<p>${logos(base)}</p>` : ''}${h1(`Coach access${name ? ` — ${esc(name)}` : ''}`)}` +
      `<p>You've been given coach access${activities.length ? ' for these stations' : ''}. Find participants by name, email, phone, or reference number — or scan the QR on their slip.</p>` +
      pills(activities) +
      creds(base, email, password, '/staff-login'),
  ),
  text:
    `Coach access${name ? ` — ${name}` : ''}\nYou've been given coach access${activities.length ? ` for: ${activities.join(', ')}` : ''}.\nSign in at: ${base ? base + '/staff-login' : '/staff-login'}\nEmail: ${email}\n` +
    (password ? `Password: ${password}\n` : 'Use the password set for you by the event owner.\n'),
});

export const mailAdmin = (
  base: string,
  email: string,
  name: string,
  password: string | null,
) => ({
  subject: `Admin access — Kore fitness challenge`,
  html: shell(
    `You've been given admin access to the Kore fitness challenge event desk.`,
    `${logos(base) ? `<p>${logos(base)}</p>` : ''}${h1(`Admin access${name ? ` — ${esc(name)}` : ''}`)}` +
      `<p>You can manage registrations, teams, result approvals, coaches, and event setup.</p>` +
      creds(base, email, password, '/staff-login'),
  ),
  text:
    `Admin access${name ? ` — ${name}` : ''}\nYou can manage registrations, teams, result approvals, coaches, and event setup.\nSign in at: ${base ? base + '/staff-login' : '/staff-login'}\nEmail: ${email}\n` +
    (password ? `Password: ${password}\n` : 'Use the password set for you by the event owner.\n'),
});
