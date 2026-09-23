# HybridCrypt — Hybrid Image Encryption Laboratory

An academic DA-1 project for **Network Information Security**, demonstrating hybrid image encryption using
**AES-256-CBC** for bulk image encryption and **RSA-2048-OAEP** for protecting the AES session key, with
**SHA-256** for integrity verification. All cryptography runs natively in the browser via the **Web Crypto API**
— nothing is simulated, and no image ever leaves the browser.

**Student:** Sai Thiagarajan · **Register No.:** 23MIS1150

## Features

- Real AES-256-CBC image encryption/decryption (`crypto.subtle.encrypt` / `decrypt`)
- Real RSA-2048-OAEP key wrapping/unwrapping (`crypto.subtle.wrapKey` / `unwrapKey`)
- Real SHA-256 integrity hashing (`crypto.subtle.digest`)
- Animated encryption/decryption pipelines with live, non-fabricated status updates
- Downloadable, portable "secure cipher bundle" (JSON) and a separate RSA private key file
- Tamper-detection demo that corrupts ciphertext and shows the resulting integrity failure
- Interactive architecture diagram, AES vs RSA vs Hybrid comparison table
- Live in-browser benchmark (AES-only vs hybrid) alongside the reference figures from the presentation
- "Explain mode" toggle that surfaces short educational notes next to each operation
- Fully responsive, dark cybersecurity-console UI

## Architecture

```
IMAGE
  → Generate AES-256 session key
  → AES-256-CBC encrypt image
  → RSA-2048-OAEP wrap AES key
  → SHA-256 hash of original
  → Secure cipher bundle (encrypted image + wrapped key + IV + hash)
  → [ Network / untrusted channel ]
  → RSA private key unwraps AES key
  → AES-256-CBC decrypt image
  → SHA-256 hash of decrypted image, compared to original
  → Original image (if hashes match)
```

## Cryptographic workflow

**AES (`src/crypto/aes.ts`)** — A fresh, random 256-bit AES-CBC key and a random 128-bit IV are generated for
every encryption. AES encrypts the full image because it is fast enough for large payloads; the IV is stored
alongside the ciphertext (it does not need to be secret, only unique per encryption).

**RSA (`src/crypto/rsa.ts`)** — A 2048-bit RSA-OAEP key pair (SHA-256 hash function, standard 65537 public
exponent) is generated per session. RSA never touches the image — only `wrapKey`/`unwrapKey` operate on the small
AES key, which is the practical way to combine RSA's secure key exchange with AES's speed.

**SHA-256 (`src/crypto/hash.ts`)** — A hash of the original image is stored in the bundle at encryption time. At
decryption time, a fresh hash of the recovered bytes is compared against it to confirm the image was not altered
or corrupted.

**Bundle (`src/crypto/bundle.ts`)** — the encrypted image and wrapped AES key are base64-encoded, the IV is
hex-encoded, and everything is packaged into one JSON file (`<filename>.hybridcrypt.json`). The RSA **private**
key is intentionally downloaded as a **separate** file (`<filename>.privatekey.json`), since in a real deployment
it would never travel over the same channel as the bundle.

## Project structure

```
src/
  components/       Navbar, ImageUploader, CryptoPipeline, CryptoDetails, KeyVisualizer,
                     IntegrityResult, PerformanceChart, ArchitectureDiagram, ComparisonTable,
                     SecurityBadge, Toaster, ExplainNote / ExplainModeContext
  pages/            Dashboard, Encrypt, Decrypt, Architecture, Performance, About
  crypto/           aes.ts, rsa.ts, hash.ts, bundle.ts  (+ __tests__/crypto.test.ts)
  utils/            file.ts, format.ts, benchmark.ts
  types/            crypto.ts
  App.tsx, main.tsx, index.css
```

Cryptographic logic is fully isolated from UI components — pages call into `src/crypto/*` and `src/utils/*` only.

## Installation & running locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

```bash
npm run build      # type-checks and produces a production build in dist/
npm run preview    # serves the production build locally
npm run test       # runs the Vitest suite for the crypto layer
npm run lint       # type-checks the project (tsc --noEmit)
```

## How to use

1. **Dashboard** — overview of the system and security posture.
2. **Encrypt** — upload a PNG/JPEG/JPG/BMP image, click **Start Hybrid Encryption**, watch the pipeline animate
   through real key generation, AES encryption, RSA key wrapping, and hashing. Download the **encrypted bundle**
   and the **RSA private key** as two separate files. Optionally, run **Simulate ciphertext tampering** to see a
   corrupted bundle fail integrity verification.
3. **Decrypt** — upload the bundle and the private key (or use the "Use last session bundle & key" shortcut),
   click **Start Decryption**, and review the side-by-side original/decrypted comparison and SHA-256 verdict.
4. **Architecture** — click through each stage of the sender → channel → receiver flow for a plain-language
   explanation.
5. **Performance** — compare the presentation's reference benchmark figures against a live in-browser
   measurement.
6. **About** — project, course, and student details.

## Academic demo flow (3–5 minutes)

1. Open **Dashboard** and explain the system in one sentence.
2. Go to **Encrypt**, upload an image, click **Start Hybrid Encryption**, and narrate the pipeline as it runs.
3. Show the **Cryptographic details** card and explain why AES handles the image while RSA only wraps the key.
4. Download the encrypted bundle and point out that the raw ciphertext is unreadable.
5. Go to **Decrypt**, load the bundle and private key, click **Start Decryption**.
6. Show the original/decrypted comparison and the **✓ INTEGRITY VERIFIED** result.
7. Visit **Architecture** to walk through the full sender-to-receiver flow.
8. Visit **Performance** and run the live benchmark against the reference figures.

## Security considerations

- AES-CBC provides confidentiality only, not authenticity — this project uses a separate SHA-256 comparison to
  detect tampering, which is why the tamper demo exists as an explicit teaching moment. A production system
  should use an authenticated mode (AES-GCM) or an encrypt-then-MAC construction so tampering is rejected
  *during* decryption rather than detected afterwards.
- The RSA private key is kept only in browser memory and downloaded on demand; it is never written to
  `localStorage` or transmitted anywhere.
- All operations run client-side; no image or key data is sent to any server.

## Browser compatibility

Requires a browser with the Web Crypto API (`window.crypto.subtle`), available in all current versions of
Chrome, Edge, Firefox, and Safari. The Web Crypto API is only available in secure contexts (`https://` or
`localhost`), which `npm run dev` and `npm run preview` both satisfy.

## Testing

`src/crypto/__tests__/crypto.test.ts` (Vitest + jsdom) covers:

1. AES encryption/decryption round trip (decrypted bytes exactly match the original)
2. RSA wrap/unwrap of the AES key, including JWK export/import of the private key
3. SHA-256 hash generation and equality checks
4. Detection of a single-byte tamper via hash mismatch or decryption failure
5. File type validation
6. Bundle creation, serialization, and parsing (including rejection of malformed bundles)
