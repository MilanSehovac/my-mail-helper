import dns from 'dns/promises';
import net from 'net';
import { config } from '../config/env.js';

const ALLOWED_PORTS = [25, 465, 587, 2525];

const isPrivateIp = (ip) => {
    if (net.isIPv4(ip)) {
        const [a, b] = ip.split('.').map(Number);
        return (
            a === 0 || a === 10 || a === 127 ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            (a === 100 && b >= 64 && b <= 127)
        );
    }
    const lower = ip.toLowerCase();
    if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice(7));
    return lower === '::1' || lower === '::' || lower.startsWith('fe80') || lower.startsWith('fc') || lower.startsWith('fd');
};

/**
 * Throws if the SMTP host/port should not be connected to (SSRF protection).
 * Set ALLOW_PRIVATE_SMTP_HOSTS=true for local development (e.g. MailHog).
 */
export const assertSafeSmtpTarget = async (host, port) => {
    if (!host || typeof host !== 'string') throw new Error('SMTP host is required');
    const portNum = Number(port);
    if (!Number.isInteger(portNum) || (!config.allowPrivateSmtpHosts && !ALLOWED_PORTS.includes(portNum))) {
        throw new Error(`SMTP port must be one of ${ALLOWED_PORTS.join(', ')}`);
    }
    if (config.allowPrivateSmtpHosts) return;

    let addresses;
    try {
        addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
    } catch {
        throw new Error('SMTP host could not be resolved');
    }
    if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
        throw new Error('SMTP host is not allowed');
    }
};
