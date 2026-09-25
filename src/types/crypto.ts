export interface CipherBundle {
  version: number;
  algorithm: 'AES-256-CBC';
  keyEncryption: 'RSA-2048-OAEP';
  hashAlgorithm: 'SHA-256';
  encryptedAESKey: string; // base64
  iv: string; // hex
  originalFileName: string;
  originalMimeType: string;
  originalFileSize: number;
  originalHash: string; // hex SHA-256 of the original plaintext image
  encryptedImage: string; // base64
}

export interface PrivateKeyFile {
  format: 'jwk';
  usage: string;
  key: JsonWebKey;
}

export interface EncryptionResult {
  bundle: CipherBundle;
  privateKeyJWK: JsonWebKey;
  aesKeyHex: string;
  timings: {
    aesMs: number;
    rsaMs: number;
    hashMs: number;
    totalMs: number;
  };
  sizes: {
    originalBytes: number;
    encryptedBytes: number;
  };
}

export interface DecryptionResult {
  decryptedBytes: ArrayBuffer;
  decryptedHash: string;
  verified: boolean;
}

export interface PipelineStage {
  id: string;
  label: string;
}
