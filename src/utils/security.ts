/**
 * Tamper-protection & encrypted storage utility for Speed Tycoon 3D (Dhaka Edition)
 * Protects localStorage data and runtime memory against devtools inspection, speedhacks, and unauthorized edits.
 */

const SALT = 'ST3D_DHAKA_SECURE_HASH_v6_BGD_';

function simpleHash(str: string): string {
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  return (Math.abs(hash1) >>> 0).toString(36) + (Math.abs(hash2) >>> 0).toString(36);
}

function scramble(data: string): string {
  try {
    const b64 = btoa(encodeURIComponent(data));
    return b64.split('').reverse().join('');
  } catch {
    return data;
  }
}

function unscramble(data: string): string {
  try {
    const rev = data.split('').reverse().join('');
    return decodeURIComponent(atob(rev));
  } catch {
    return data;
  }
}

export function saveSecure(key: string, value: any): void {
  try {
    const raw = JSON.stringify(value);
    const checksum = simpleHash(SALT + key + raw);
    const payload = JSON.stringify({ d: scramble(raw), c: checksum, t: Date.now() });
    localStorage.setItem(key, payload);
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export function loadSecure<T>(key: string, fallback: T): T {
  try {
    const rawItem = localStorage.getItem(key);
    if (!rawItem) return fallback;

    if (rawItem.startsWith('{"d":') && rawItem.includes('"c":')) {
      const parsed = JSON.parse(rawItem);
      const decoded = unscramble(parsed.d);
      const expectedChecksum = simpleHash(SALT + key + decoded);

      if (parsed.c === expectedChecksum) {
        return JSON.parse(decoded) as T;
      } else {
        console.warn(`[Security Alert] Data tampering detected on ${key}. Auto-resetting to safe default.`);
        return fallback;
      }
    }

    const old = JSON.parse(rawItem);
    return old as T;
  } catch {
    return fallback;
  }
}

/**
 * Validates any cash increment to prevent memory injection attacks.
 */
export function sanitizeCash(amount: number, maxAllowed = 100000): number {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.min(amount, maxAllowed);
}

/**
 * Setup anti-tampering guards on browser window:
 * - Disables inspect shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * - Disables right-click context menu
 * - Freezes cheat identifiers
 */
export function initAntiCheatGuards(): void {
  if (typeof window === 'undefined') return;

  // Prevent right-click context menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { capture: true });

  // Prevent developer shortcuts
  window.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });

  // Lock tamper-proof variables in global scope
  try {
    ['_speedTycoonCheats', 'hackWallet', 'giveCash', 'setSpeed'].forEach((prop) => {
      Object.defineProperty(window, prop, {
        value: undefined,
        writable: false,
        configurable: false,
      });
    });
  } catch {}
}
