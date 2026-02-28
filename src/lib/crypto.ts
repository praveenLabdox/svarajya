// Module 3: WebCrypto encryption helpers for credential vault.
// Uses AES-GCM for encryption, PBKDF2 for key derivation.
// All operations use window.crypto.subtle — pure web, no backend.

const ITERATIONS = 210_000;
const KEY_LENGTH = 256;

/**
 * Derive an AES-GCM key from a master passphrase + random salt using PBKDF2.
 */
export async function deriveKey(
    passphrase: string,
    salt: Uint8Array,
    iterations: number = ITERATIONS
): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypt a plaintext string → returns base64 salt, iv, ciphertext.
 */
export async function encryptString(
    plaintext: string,
    passphrase: string
): Promise<{
    saltB64: string;
    ivB64: string;
    cipherTextB64: string;
    iterations: number;
}> {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);

    const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plaintext)
    );

    return {
        saltB64: uint8ToBase64(salt),
        ivB64: uint8ToBase64(iv),
        cipherTextB64: uint8ToBase64(new Uint8Array(cipherBuffer)),
        iterations: ITERATIONS,
    };
}

/**
 * Decrypt a ciphertext using the passphrase + stored salt/iv.
 * Throws on incorrect passphrase.
 */
export async function decryptString(
    encrypted: {
        saltB64: string;
        ivB64: string;
        cipherTextB64: string;
        iterations: number;
    },
    passphrase: string
): Promise<string> {
    const salt = base64ToUint8(encrypted.saltB64);
    const iv = base64ToUint8(encrypted.ivB64);
    const cipherText = base64ToUint8(encrypted.cipherTextB64);

    const key = await deriveKey(passphrase, salt, encrypted.iterations);

    const plainBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        cipherText
    );

    return new TextDecoder().decode(plainBuffer);
}

/**
 * Verify that a passphrase can decrypt a test blob.
 * Used to validate master passphrase on unlock.
 */
export async function verifyPassphrase(
    testEncrypted: {
        saltB64: string;
        ivB64: string;
        cipherTextB64: string;
        iterations: number;
    },
    passphrase: string
): Promise<boolean> {
    try {
        await decryptString(testEncrypted, passphrase);
        return true;
    } catch {
        return false;
    }
}

// ——— Base64 helpers ———

function uint8ToBase64(arr: Uint8Array): string {
    let binary = "";
    arr.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        arr[i] = binary.charCodeAt(i);
    }
    return arr;
}
