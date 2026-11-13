/**
 * Failed-submission counter per problem set, backed by localStorage and
 * exposed to React through useSyncExternalStore so server rendering and
 * hydration agree. The counter drives the workspace's hint ladder: 1+ failed
 * submission reveals the pitfall checklist, 2+ auto-surfaces hint 1. Cleared
 * on the first passing submission. Client-safe: NOTHING in here knows about
 * hidden testbenches.
 */

const PREFIX = "hdlforge:fails:";

const listeners = new Map<string, Set<() => void>>();

function listenerSet(key: string): Set<() => void> {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

export function readFailCount(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? 0 : Math.max(0, Number(raw) || 0);
  } catch {
    return 0;
  }
}

export function writeFailCount(key: string, n: number): void {
  const next = Math.max(0, n);
  try {
    if (next === 0) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, String(next));
  } catch {
    /* storage unavailable — counter lives for this session only */
  }
  for (const fn of listenerSet(key)) fn();
}

/** Stable subscribe function for useSyncExternalStore. */
export function subscribeFails(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  // Any tab (including this one, via storage events) changing the value
  // notifies every listener; we keep one set per key.
  window.addEventListener("storage", onStorage);
  // Register under a wildcard key so one subscribe works for every pset —
  // useSyncExternalStore re-runs getSnapshot after every notify, and a stale
  // value for another key is harmless.
  const set = wildcard();
  set.add(callback);
  return () => {
    set.delete(callback);
    if (set.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function wildcard(): Set<() => void> {
  let set = listeners.get("*");
  if (!set) {
    set = new Set();
    listeners.set("*", set);
  }
  return set;
}

function onStorage(): void {
  for (const fn of wildcard()) fn();
}
