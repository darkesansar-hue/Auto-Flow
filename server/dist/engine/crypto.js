import crypto from 'node:crypto';
// Use environment variable or fallback secret key for local development
const SECRET_KEY = process.env.FLOWFORGE_SECRET_KEY
    ? crypto.createHash('sha256').update(process.env.FLOWFORGE_SECRET_KEY).digest()
    : crypto.createHash('sha256').update('flowforge-default-local-encryption-key-32b').digest();
export function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
export function decrypt(encryptedText) {
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted token format');
        }
        const [ivHex, authTagHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (err) {
        throw new Error(`Decryption failed: ${err.message}`);
    }
}
