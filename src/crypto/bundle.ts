import type { CipherBundle } from '../types/crypto';
import { bufToBase64, base64ToBuf, bufToHex, hexToBuf } from '../utils/file';

const BUNDLE_VERSION = 1;

export interface CreateBundleInput {
  encryptedImage: ArrayBuffer;
  iv: Uint8Array;
  encryptedAESKey: ArrayBuffer;
  originalFileName: string;
  originalMimeType: string;
  originalFileSize: number;
  originalHash: string;
}

export function createBundle(input: CreateBundleInput): CipherBundle {
  return {
    version: BUNDLE_VERSION,
    algorithm: 'AES-256-CBC',
    keyEncryption: 'RSA-2048-OAEP',
    hashAlgorithm: 'SHA-256',
    encryptedAESKey: bufToBase64(input.encryptedAESKey),
    iv: bufToHex(input.iv.slice().buffer),
    originalFileName: input.originalFileName,
    originalMimeType: input.originalMimeType,
    originalFileSize: input.originalFileSize,
    originalHash: input.originalHash,
    encryptedImage: bufToBase64(input.encryptedImage)
  };
}

export function parseBundle(json: unknown): CipherBundle {
  const b = json as Partial<CipherBundle>;
  if (
    !b ||
    typeof b.encryptedImage !== 'string' ||
    typeof b.encryptedAESKey !== 'string' ||
    typeof b.iv !== 'string' ||
    typeof b.originalHash !== 'string'
  ) {
    throw new Error('Invalid encrypted bundle.');
  }
  return b as CipherBundle;
}

export function bundleEncryptedImageBuffer(bundle: CipherBundle): ArrayBuffer {
  return base64ToBuf(bundle.encryptedImage);
}

export function bundleEncryptedKeyBuffer(bundle: CipherBundle): ArrayBuffer {
  return base64ToBuf(bundle.encryptedAESKey);
}

export function bundleIvBuffer(bundle: CipherBundle): Uint8Array {
  return new Uint8Array(hexToBuf(bundle.iv));
}
