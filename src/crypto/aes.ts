/**
 * AES-256-CBC symmetric encryption.
 * Used to encrypt the bulk image data. The 256-bit key and 128-bit IV are
 * generated with cryptographically secure random values on every call.
 */

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, [
    'encrypt',
    'decrypt'
  ]);
}

export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Web Crypto requires an ArrayBuffer-backed view. Copying the 16-byte IV
 * accepts any Uint8Array (e.g. one backed by a SharedArrayBuffer) safely.
 */
function toIvParam(iv: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(iv);
}

export async function aesEncrypt(
  key: CryptoKey,
  iv: Uint8Array,
  data: ArrayBuffer
): Promise<ArrayBuffer> {
  return crypto.subtle.encrypt({ name: 'AES-CBC', iv: toIvParam(iv) }, key, data);
}

export async function aesDecrypt(
  key: CryptoKey,
  iv: Uint8Array,
  data: ArrayBuffer
): Promise<ArrayBuffer> {
  // Throws (e.g. on invalid PKCS#7 padding) when the ciphertext or key
  // does not match — this is itself a useful tamper-detection signal.
  return crypto.subtle.decrypt({ name: 'AES-CBC', iv: toIvParam(iv) }, key, data);
}

/**
 * Exports the raw AES key as a hex string, for the "Show / Hide" educational
 * display only. Never used for any decision logic and never persisted.
 */
export async function exportAESKeyHex(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return [...new Uint8Array(raw)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
