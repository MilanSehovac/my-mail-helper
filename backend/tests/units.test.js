import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SMTP_ENCRYPTION_KEY = 'x'.repeat(40);
process.env.JWT_SECRET = 'y'.repeat(40);

const { encryptSecret, decryptSecret } = await import('../src/utils/secrets.js');
const { renderTemplate, buildContext, findUnknownVariables } = await import('../src/services/templateRenderer.js');
const { assertSafeSmtpTarget } = await import('../src/utils/smtpGuard.js');
const { createUnsubscribeToken, verifyUnsubscribeToken } = await import('../src/utils/unsubscribeToken.js');

test('secrets round-trip and never store plaintext', () => {
    const enc = encryptSecret('hunter2');
    assert.notEqual(enc, 'hunter2');
    assert.ok(enc.startsWith('enc:v1:'));
    assert.equal(decryptSecret(enc), 'hunter2');
    assert.equal(decryptSecret('legacy-plaintext'), 'legacy-plaintext');
});

test('renderer fills variables and escapes HTML values', () => {
    const ctx = buildContext({
        contact: { full_name: 'Sarah <b>Mitchell</b>', email: 's@x.io' },
        agency: { name: 'Pixel & Co.' },
        sender: { first_name: 'Alex', last_name: 'Liu', email: 'a@y.io' },
    });
    const out = renderTemplate({ subject: 'Hi {{agency_name}}', body: 'Hello {{first_name}}\nfrom {{sender_name}}' }, ctx);
    assert.equal(out.subject, 'Hi Pixel & Co.');
    assert.equal(out.text, 'Hello Sarah\nfrom Alex Liu');
    assert.equal(out.html, 'Hello Sarah<br>\nfrom Alex Liu');
    const html = renderTemplate({ subject: 's', body: '{{full_name}}' }, ctx).html;
    assert.ok(!html.includes('<b>'));
});

test('renderer rejects unknown variables', () => {
    assert.deepEqual(findUnknownVariables('{{first_name}} {{agency_id}}'), ['agency_id']);
    assert.throws(() => renderTemplate({ subject: 's', body: '{{nope}}' }, {}), /Unknown template variable/);
});

test('SMTP guard blocks private targets and odd ports', async () => {
    await assert.rejects(assertSafeSmtpTarget('127.0.0.1', 587));
    await assert.rejects(assertSafeSmtpTarget('169.254.169.254', 587));
    await assert.rejects(assertSafeSmtpTarget('10.0.0.5', 587));
    await assert.rejects(assertSafeSmtpTarget('8.8.8.8', 6379));
    await assert.doesNotReject(assertSafeSmtpTarget('8.8.8.8', 587));
});

test('retry classification only retries when the message was not accepted', async () => {
    const { isSafeToRetry, backoffMs } = await import('../src/services/campaignWorker.js');
    assert.equal(isSafeToRetry({ responseCode: 451 }), true);
    assert.equal(isSafeToRetry({ code: 'ECONNECTION', command: 'CONN' }), true);
    assert.equal(isSafeToRetry({ responseCode: 550 }), false);
    assert.equal(isSafeToRetry({ code: 'EAUTH' }), false);
    // timeout after the connection was established: delivery unknown -> never retried
    assert.equal(isSafeToRetry({ code: 'ETIMEDOUT', command: 'DATA' }), false);
    assert.equal(isSafeToRetry(new Error('boom')), false);
    const first = backoffMs(1), third = backoffMs(3);
    assert.ok(first >= 4 * 60 * 1000 && first <= 6 * 60 * 1000);
    assert.ok(third > first);
    assert.ok(backoffMs(20) <= 72 * 60 * 1000);
});

test('unsubscribe token round-trips and rejects tampering', () => {
    const token = createUnsubscribeToken(42);
    assert.equal(verifyUnsubscribeToken(token), 42);
    assert.throws(() => verifyUnsubscribeToken(token.slice(0, -2) + 'xx'));
});
