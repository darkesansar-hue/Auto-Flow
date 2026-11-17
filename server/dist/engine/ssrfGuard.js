import { URL } from 'node:url';
import net from 'node:net';
export function validateUrlForSSRF(targetUrl) {
    try {
        const parsed = new URL(targetUrl);
        // Only allow http & https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { allowed: false, reason: `Protocol '${parsed.protocol}' is disallowed. Only HTTP and HTTPS are permitted.` };
        }
        const hostname = parsed.hostname.toLowerCase();
        // Block localhost, loopbacks, and local names
        if (hostname === 'localhost' ||
            hostname.endsWith('.localhost') ||
            hostname.endsWith('.local') ||
            hostname === '0.0.0.0' ||
            hostname === '127.0.0.1' ||
            hostname === '::1') {
            return { allowed: false, reason: 'Loopback and localhost destinations are prohibited for security.' };
        }
        // Check if hostname is an IP address
        if (net.isIP(hostname)) {
            if (isPrivateIP(hostname)) {
                return { allowed: false, reason: `IP ${hostname} belongs to a private/internal network and cannot be accessed.` };
            }
        }
        return { allowed: true };
    }
    catch (err) {
        return { allowed: false, reason: `Invalid URL format: ${err.message}` };
    }
}
function isPrivateIP(ip) {
    if (ip === '::1' || ip === '127.0.0.1')
        return true;
    // IPv4 checks
    const parts = ip.split('.').map(Number);
    if (parts.length === 4) {
        // 10.0.0.0 – 10.255.255.255
        if (parts[0] === 10)
            return true;
        // 172.16.0.0 – 172.31.255.255
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
            return true;
        // 192.168.0.0 – 192.168.255.255
        if (parts[0] === 192 && parts[1] === 168)
            return true;
        // 169.254.0.0 – 169.254.255.255 (Link-Local & Cloud Metadata)
        if (parts[0] === 169 && parts[1] === 254)
            return true;
        // 127.0.0.0/8
        if (parts[0] === 127)
            return true;
        // 0.0.0.0/8
        if (parts[0] === 0)
            return true;
    }
    return false;
}
