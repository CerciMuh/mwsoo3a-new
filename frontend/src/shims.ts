// Browser shims for Node-style globals used by some dependencies (e.g., buffer/amazon-cognito-identity-js)
import { Buffer } from 'buffer'

// Ensure global points to window/globalThis
;(window as any).global = (window as any).global || window

// Minimal process shim
;(window as any).process = (window as any).process || { env: {} }

// Buffer shim
;(window as any).Buffer = (window as any).Buffer || Buffer

// crypto shim (most browsers expose window.crypto)
if (!(globalThis as any).crypto && (window as any).msCrypto) {
  ;(globalThis as any).crypto = (window as any).msCrypto
}
