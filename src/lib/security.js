const SALT = "s1gn4l-s3cur1ty-h4sh-c0r3";

export const obfuscateSave = (key, value) => {
  try {
    const payload = btoa(JSON.stringify({ v: value, s: SALT }));
    localStorage.setItem(key, payload);
  } catch (err) {
    console.error("Storage obfuscation failed", err);
  }
};

export const readObfuscatedSave = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(atob(raw));
    if (parsed.s !== SALT) return fallback;
    return parsed.v;
  } catch (err) {
    return fallback;
  }
};

export const generateSignature = (score, playerId, timestamp) => {
  // A simplistic client-side payload signature deterrent.
  // Combines the core payload dimensions with the salt and obfuscates it.
  const rawData = `${score}:${playerId}:${timestamp}:${SALT}`;
  return btoa(rawData);
};
