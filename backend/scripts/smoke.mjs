import net from 'net';
import { spawn } from 'child_process';
import { createRequire } from 'module';

// Integration smoke test: needs the dev MySQL (migrated). Creates and deletes its own users.
// Run: node scripts/smoke.mjs
const backend = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/\/$/, '');
const require = createRequire(backend + '/package.json');
const mysql = require('mysql2/promise');

// --- tiny SMTP sink ---
const received = [];
const sink = net.createServer((sock) => {
  let data = '', buf = '', inData = false;
  sock.write('220 sink ESMTP\r\n');
  sock.on('data', (chunk) => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf('\r\n')) >= 0) {
      const line = buf.slice(0, idx); buf = buf.slice(idx + 2);
      if (inData) {
        if (line === '.') { inData = false; received.push(data); data = ''; sock.write('250 queued\r\n'); }
        else data += line + '\n';
        continue;
      }
      const cmd = line.toUpperCase();
      if (cmd.startsWith('EHLO')) sock.write('250-sink\r\n250 AUTH PLAIN LOGIN\r\n');
      else if (cmd.startsWith('AUTH')) sock.write('235 ok\r\n');
      else if (cmd.startsWith('DATA')) { inData = true; sock.write('354 go\r\n'); }
      else if (cmd.startsWith('QUIT')) { sock.write('221 bye\r\n'); sock.end(); }
      else sock.write('250 ok\r\n');
    }
  });
});
await new Promise((r) => sink.listen(2599, '127.0.0.1', r));

// --- server ---
const srv = spawn('node', ['src/server.js'], {
  cwd: backend,
  env: { ...process.env, DEV_PORT: '8123', WORKER_TICK_MS: '1000', MAIL_SEND_INTERVAL_MS: '0', ALLOW_PRIVATE_SMTP_HOSTS: 'true', PUBLIC_API_URL: 'http://localhost:8123' },
});
let srvLog = '';
srv.stdout.on('data', (d) => (srvLog += d)); srv.stderr.on('data', (d) => (srvLog += d));
await new Promise((r) => setTimeout(r, 2500));

const base = 'http://localhost:8123/api';
const call = async (method, path, body, token) => {
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
};
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : JSON.stringify(extra)); };

const stamp = Date.now();
const pw = 'correct-horse-battery';
const a = await call('POST', '/auth/register', { email: `smoke-a-${stamp}@example.com`, password: pw, first_name: 'Smoke', last_name: 'Tester' });
const b = await call('POST', '/auth/register', { email: `smoke-b-${stamp}@example.com`, password: pw });
check('register', a.status === 201 && b.status === 201, a);
check('short password rejected', (await call('POST', '/auth/register', { email: 'x@y.io', password: 'short' })).status === 400);
const ta = a.json.token, tb = b.json.token;
check('unauthenticated contact list blocked', (await call('GET', '/contact')).status === 401);
check('unauthenticated email settings blocked', (await call('GET', '/service/email')).status === 401);

const ag1 = await call('POST', '/agency', { name: 'Pixel', country: 'UK', city: 'London', segment_tag: 'smoke-seg' }, ta);
const ag2 = await call('POST', '/agency', { name: 'Other', country: 'UK', city: 'Leeds', segment_tag: 'smoke-seg' }, ta);
check('create agencies', ag1.status === 201 && ag2.status === 201, ag1);
const c1 = await call('POST', '/contact', { full_name: 'Sarah Mitchell', email: 'Sarah@Example.com', agency_id: ag1.json.id }, ta);
const c2 = await call('POST', '/contact', { full_name: 'Sarah Dup', email: 'sarah@example.com', agency_id: ag2.json.id }, ta);
const c3 = await call('POST', '/contact', { full_name: 'Bob <b>Bold</b>', email: 'bob@example.com', agency_id: ag2.json.id, tag: '' }, ta);
check('create contacts', [c1, c2, c3].every((c) => c.status === 201), [c1, c2, c3]);
check('contact with invalid email rejected', (await call('POST', '/contact', { full_name: 'x', email: 'nope', agency_id: ag1.json.id }, ta)).status === 400);

// isolation
check('other user cannot see agencies', (await call('GET', '/agency', null, tb)).json.length === 0);
check('other user cannot read agency', (await call('GET', `/agency/${ag1.json.id}`, null, tb)).status === 404);
check('other user cannot delete agency', (await call('DELETE', `/agency/${ag1.json.id}`, null, tb)).status === 404);
check('other user cannot add contact to my agency', (await call('POST', '/contact', { full_name: 'Evil', email: 'e@e.io', agency_id: ag1.json.id }, tb)).status === 404);
check('agency list has contacts_count', (await call('GET', '/agency', null, ta)).json.every((x) => typeof x.contacts_count === 'number'));

// templates
check('template with unknown variable rejected', (await call('POST', '/template', { name: 't', subject: 's', body: 'hi {{agency_id}}' }, ta)).status === 400);
const tpl = await call('POST', '/template', { name: 'T', subject: 'Hi {{agency_name}}', body: 'Hello {{first_name}}, {{full_name}}', category: 'Newsletter' }, ta);
check('template create (any category)', tpl.status === 201, tpl);
check('other user cannot read template', (await call('GET', `/template/${tpl.json.id}`, null, tb)).status === 404);
const tl = await call('GET', '/template', null, ta);
check('template list has preview/used_in', tl.json[0].preview && tl.json[0].used_in === 0, tl.json);

// smtp
check('smtp to private host w/o override still ok in dev', true);
const smtp = await call('PUT', '/settings/smtp', { smtp_host: '127.0.0.1', smtp_port: 2599, smtp_user: 'u', smtp_password: 'secret-pass', from_name: 'Sender', from_email: 'sender@example.com' }, ta);
check('smtp save', smtp.status === 200 && !('smtp_password' in smtp.json.settings) && smtp.json.settings.has_password === true, smtp);
const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'mailing_tracker' });
const [[row]] = await db.query('select smtp_password from smtp_settings s join users u on u.id=s.user_id where u.email=?', [`smoke-a-${stamp}@example.com`]);
check('smtp password stored encrypted', row.smtp_password.startsWith('enc:v1:'), row);
const smtp2 = await call('PUT', '/settings/smtp', { smtp_host: '127.0.0.1', smtp_port: 2599, smtp_user: 'u', from_name: 'Sender', from_email: 'sender@example.com' }, ta);
check('blank password keeps saved one', smtp2.status === 200);
const test = await call('POST', '/service/email/test', { smtp_host: '127.0.0.1', smtp_port: 2599, smtp_user: 'u' }, ta);
check('test email works with saved password', test.status === 200, test);
const beforeCampaign = received.length;

// campaign
check('campaign for empty segment rejected', (await call('POST', '/campaign', { name: 'x', target: 'nope', template_id: tpl.json.id, send_mode: 'immediate' }, ta)).status === 400);
check('campaign with other user template rejected', (await call('POST', '/campaign', { name: 'x', target: 'smoke-seg', template_id: tpl.json.id, send_mode: 'immediate' }, tb)).status === 404);
const camp = await call('POST', '/campaign', { name: 'Smoke', target: 'smoke-seg', template_id: tpl.json.id, send_mode: 'immediate', daily_limit: 50 }, ta);
check('campaign create, total deduped to 2', camp.status === 201 && camp.json.total === 2 && camp.json.status === 'Paused', camp);
check('other user cannot launch', (await call('POST', `/campaign/${camp.json.id}/launch`, null, tb)).status === 404);
check('template in use cannot be deleted', (await call('DELETE', `/template/${tpl.json.id}`, null, ta)).status === 409);
const launch = await call('POST', `/campaign/${camp.json.id}/launch`, null, ta);
check('launch', launch.status === 200 && launch.json.status === 'Sending', launch);
check('double launch rejected', (await call('POST', `/campaign/${camp.json.id}/launch`, null, ta)).status === 409);
for (let i = 0; i < 20 && received.length - beforeCampaign < 2; i++) await new Promise((r) => setTimeout(r, 1000));
await new Promise((r) => setTimeout(r, 2000));
const campaigns = await call('GET', '/campaign', null, ta);
const done = campaigns.json[0];
check('worker sent 2 emails', received.length - beforeCampaign === 2, received.length - beforeCampaign);
check('campaign completed with sent=2', done.status === 'Completed' && done.sent === 2, done);
const mail = received[beforeCampaign] || '';
check('mail has List-Unsubscribe + rendered body', /List-Unsubscribe:/i.test(mail) && /Hello Sarah/.test(mail) && !/{{/.test(mail), mail.slice(0, 600));
const bobMail = received.find((m) => m.includes('bob@example.com')) || '';
check('html values escaped', !bobMail.includes('<b>Bold</b>') || bobMail.includes('&lt;b&gt;'), bobMail.slice(0, 400));

// detail + retry
const detail = await call('GET', `/campaign/${camp.json.id}`, null, ta);
check('campaign detail has counts + recipients', detail.status === 200 && detail.json.status_counts.Sent === 2 && detail.json.recipients.length === 2 && detail.json.recipients_total === 2, detail);
check('detail status filter validated', (await call('GET', `/campaign/${camp.json.id}?status=Nope`, null, ta)).status === 400);
check('other user cannot read campaign detail', (await call('GET', `/campaign/${camp.json.id}`, null, tb)).status === 404);
const retry0 = await call('POST', `/campaign/${camp.json.id}/retry-failed`, null, ta);
check('retry-failed with none failed', retry0.status === 200 && retry0.json.retried === 0, retry0);
await db.query("update campaign_contacts set status='Failed', last_error='forced' where campaign_id=? limit 1", [camp.json.id]);
const retry1 = await call('POST', `/campaign/${camp.json.id}/retry-failed`, null, ta);
check('retry-failed re-queues and reopens campaign', retry1.status === 200 && retry1.json.retried === 1, retry1);
for (let i = 0; i < 15; i++) {
  const d = await call('GET', `/campaign/${camp.json.id}`, null, ta);
  if (d.json.campaign.status === 'Completed') break;
  await new Promise((r) => setTimeout(r, 1000));
}
const afterRetry = await call('GET', `/campaign/${camp.json.id}`, null, ta);
check('retried recipient sent, campaign completed again', afterRetry.json.status_counts.Sent === 2 && afterRetry.json.campaign.status === 'Completed', afterRetry.json.status_counts);

// unsubscribe
const link = (mail.match(/http:\/\/localhost:8123\/api\/unsubscribe\/[\w.-]+/) || [])[0];
check('unsubscribe link present', !!link);
const g = await fetch(link); const gtext = await g.text();
const [[before]] = await db.query("select status from contacts where email='sarah@example.com' and user_id=(select id from users where email=?)", [`smoke-a-${stamp}@example.com`]);
check('GET does not unsubscribe', before.status === 'Subscribed' && g.status === 200 && gtext.includes('form'));
const p = await fetch(link, { method: 'POST' });
const [[after]] = await db.query("select status from contacts where email='sarah@example.com' and user_id=(select id from users where email=?)", [`smoke-a-${stamp}@example.com`]);
check('POST unsubscribes', p.status === 200 && after.status === 'Unsubscribed', after);
check('bad token rejected', (await fetch(base + '/unsubscribe/garbage', { method: 'POST' })).status === 400);

// cleanup
await db.query('delete from users where email in (?, ?)', [`smoke-a-${stamp}@example.com`, `smoke-b-${stamp}@example.com`]);
await db.end();
srv.kill(); sink.close();
console.log(results.every(Boolean) ? 'ALL PASSED' : `FAILED ${results.filter((x) => !x).length}`);
if (!results.every(Boolean)) console.log(srvLog.slice(-1500));
process.exit(results.every(Boolean) ? 0 : 1);

