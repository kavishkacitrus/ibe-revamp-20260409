/**
 * Simple encryption/decryption utility for URL obfuscation.
 * Note: This is client-side obfuscation. For true security, 
 * use server-side validation.
 */

const SECRET_SALT = 'hm_secure_v2';

export const encryptData = (data: any): string => {
    try {
        const jsonStr = JSON.stringify(data);
        // Step 1: Base64 encoding
        const base64 = btoa(jsonStr);
        // Step 2: Simple character shifting/obfuscation
        const obfuscated = base64.split('').map((char, index) => {
            const charCode = char.charCodeAt(0);
            const saltChar = SECRET_SALT[index % SECRET_SALT.length];
            const saltCode = saltChar.charCodeAt(0);
            return String.fromCharCode(charCode ^ (saltCode % 5)); // Minimal XOR XOR shift
        }).join('');

        return encodeURIComponent(btoa(obfuscated));
    } catch (error) {
        console.error('Encryption error:', error);
        return '';
    }
};

export const decryptData = (encrypted: string): any => {
    try {
        if (!encrypted) return null;

        // Step 1: Decode from URI and Base64
        const obfuscated = atob(decodeURIComponent(encrypted));

        // Step 2: Reverse obfuscation
        const base64 = obfuscated.split('').map((char, index) => {
            const charCode = char.charCodeAt(0);
            const saltChar = SECRET_SALT[index % SECRET_SALT.length];
            const saltCode = saltChar.charCodeAt(0);
            return String.fromCharCode(charCode ^ (saltCode % 5));
        }).join('');

        // Step 3: Decode Base64 and parse JSON
        const jsonStr = atob(base64);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};
