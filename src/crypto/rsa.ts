/**
 * RSA-2048 with OAEP padding.
 * RSA never touches the image itself — it only wraps (encrypts) and
 * unwraps (decrypts) the small AES session key.
 */

export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['wrapKey', 'unwrapKey']
  ) as Promise<CryptoKeyPair>;
}

export async function wrapAESKey(
  aesKey: CryptoKey,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  return crypto.subtle.wrapKey('raw', aesKey, publicKey, { name: 'RSA-OAEP' });
}

export async function unwrapAESKey(
  wrapped: ArrayBuffer,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    wrapped,
    privateKey,
    { name: 'RSA-OAEP' },
    { name: 'AES-CBC' },
    true,
    ['decrypt']
  );
}

export async function exportPrivateKeyJWK(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function importPrivateKeyJWK(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['unwrapKey']
  );
}
