// VIP Key Generator & Validator System for ALONE BHAI Predictor

const SECRET_SALT = "ALONE_BHAI_SECRET_SALT_2026";

// Built-in emergency master keys (always valid lifetime)
const MASTER_KEYS = ["ALONE-VIP-2026", "ALONE-BHAI-2026", "ALONE-777"];

export interface KeyValidationResult {
  isValid: boolean;
  message: string;
  expiresAt?: number;
  durationType?: string;
  isMaster?: boolean;
}

export function computeKeyHash(payload: string): string {
  let hash = 0;
  const str = payload + SECRET_SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4);
}

// Generate a valid key (used by standalone admin HTML & internal helper)
export function generateKey(durationType: '1H' | '1D' | '7D' | '30D' | 'PERM'): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `ALONE-${durationType}-${timestamp}`;
  const hash = computeKeyHash(payload);
  return `${payload}-${hash}`;
}

// Verify if a raw key string is authentic
export function verifyRawKey(keyInput: string): { isValid: boolean; durationType: string; timestamp: number } {
  const cleanKey = keyInput.trim().toUpperCase();

  // Check master keys
  if (MASTER_KEYS.includes(cleanKey)) {
    return { isValid: true, durationType: 'PERM', timestamp: Date.now() };
  }

  // Check generated key format: ALONE-[DURATION]-[TIMESTAMP]-[HASH]
  const parts = cleanKey.split('-');
  if (parts.length !== 4 || parts[0] !== 'ALONE') {
    return { isValid: false, durationType: '', timestamp: 0 };
  }

  const [_, durationType, tsStr, providedHash] = parts;
  const payload = `ALONE-${durationType}-${tsStr}`;
  const expectedHash = computeKeyHash(payload);

  if (providedHash !== expectedHash) {
    return { isValid: false, durationType: '', timestamp: 0 };
  }

  const timestamp = parseInt(tsStr, 10);
  return { isValid: true, durationType, timestamp };
}

// Get Duration in milliseconds
export function getDurationMs(durationType: string): number {
  switch (durationType) {
    case '1H':
      return 60 * 60 * 1000; // 1 hour
    case '1D':
      return 24 * 60 * 60 * 1000; // 1 day
    case '7D':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case '30D':
      return 30 * 24 * 60 * 60 * 1000; // 30 days
    case 'PERM':
      return 100 * 365 * 24 * 60 * 60 * 1000; // 100 years (Lifetime)
    default:
      return 24 * 60 * 60 * 1000;
  }
}

// Check saved key status from localStorage
export function getSavedKeyStatus(): KeyValidationResult {
  try {
    const saved = localStorage.getItem('alone_vip_activation');
    if (!saved) {
      return { isValid: false, message: 'NO_KEY' };
    }

    const data = JSON.parse(saved);
    const now = Date.now();

    if (data.isMaster || data.durationType === 'PERM') {
      return {
        isValid: true,
        message: 'LIFETIME_VIP',
        expiresAt: now + 365 * 24 * 60 * 60 * 1000,
        durationType: 'PERM',
        isMaster: true,
      };
    }

    if (now > data.expiresAt) {
      return { isValid: false, message: 'EXPIRED' };
    }

    return {
      isValid: true,
      message: 'ACTIVE',
      expiresAt: data.expiresAt,
      durationType: data.durationType,
    };
  } catch (e) {
    return { isValid: false, message: 'ERROR' };
  }
}

// Activate a key locally
export function activateKey(rawKey: string): KeyValidationResult {
  const verified = verifyRawKey(rawKey);
  if (!verified.isValid) {
    return { isValid: false, message: 'INVALID_KEY' };
  }

  const durationMs = getDurationMs(verified.durationType);
  const now = Date.now();
  const expiresAt = now + durationMs;

  const activationData = {
    key: rawKey.trim().toUpperCase(),
    activatedAt: now,
    expiresAt,
    durationType: verified.durationType,
    isMaster: verified.durationType === 'PERM',
  };

  localStorage.setItem('alone_vip_activation', JSON.stringify(activationData));

  return {
    isValid: true,
    message: 'SUCCESS',
    expiresAt,
    durationType: verified.durationType,
    isMaster: verified.durationType === 'PERM',
  };
}
