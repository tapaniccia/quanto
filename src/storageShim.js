/**
 * Lightweight polyfill for the `window.storage` key-value API the app was built
 * against (get/set/delete/list, with a `shared` flag), backed by the browser's
 * localStorage so the app works standalone once deployed anywhere.
 *
 * IMPORTANT LIMITATION: localStorage lives only in this browser, on this device.
 * The `shared` flag here does NOT sync data between different phones/computers —
 * it only separates "shared household data" from "just-for-me data" within the
 * SAME browser. If you and your partner open this on separate devices, you will
 * each see your own local copy, not a synced one.
 *
 * To get real cross-device sharing, swap this file out for a small backend
 * (Firebase Firestore, Supabase, or your own API) that implements the same
 * four methods. See README.md for pointers.
 */

function keyFor(key, shared) {
  return `quanto:${shared ? "shared" : "user"}:${key}`;
}

window.storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(keyFor(key, shared));
    if (raw === null) {
      throw new Error(`quanto storage: key not found: ${key}`);
    }
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(keyFor(key, shared), value);
      return { key, value, shared };
    } catch (err) {
      console.error("quanto storage: set failed", err);
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      localStorage.removeItem(keyFor(key, shared));
      return { key, deleted: true, shared };
    } catch (err) {
      console.error("quanto storage: delete failed", err);
      return null;
    }
  },

  async list(prefix = "", shared = false) {
    const scope = `quanto:${shared ? "shared" : "user"}:`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(scope + prefix)) keys.push(k.slice(scope.length));
    }
    return { keys, prefix, shared };
  },
};
