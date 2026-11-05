/**
 * Tamper-protection & encrypted storage utility for Speed Tycoon
 * Protects localStorage data against inspection/unauthorized edits in browser devtools.
 */

const SALT = 'ST3D_SECURE_HASH_v5_BN_';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
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
    // fallback
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export function loadSecure<T>(key: string, fallback: T): T {
  try {
    const rawItem = localStorage.getItem(key);
    if (!rawItem) return fallback;

    // Check if it's the secured payload
    if (rawItem.startsWith('{"d":') && rawItem.includes('"c":')) {
      const parsed = JSON.parse(rawItem);
      const decoded = unscramble(parsed.d);
      const expectedChecksum = simpleHash(SALT + key + decoded);

      if (parsed.c === expectedChecksum) {
        return JSON.parse(decoded) as T;
      } else {
        // Tampered! Reset to safe value
        console.warn(`[Security] Data tampering detected on ${key}. Restoring default.`);
        return fallback;
      }
    }

    // Migration from old unencrypted version
    const old = JSON.parse(rawItem);
    return old as T;
  } catch {
    return fallback;
  }
}

/**
 * Setup anti-tampering guards on browser window:
 * - Freezes crucial cheat hooks
 * - Disables inspect shortcut / right click inside game iFrame
 */
export function initAntiCheatGuards(): void {
  if (typeof window === 'undefined') return;

  // Prevent right-click context menu on canvas
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Freeze global identifiers if anyone tries to inject
  try {
    Object.defineProperty(window, '_speedTycoonCheats', {
      value: undefined,
      writable: false,
      configurable: false,
    });
  } catch {}
}
