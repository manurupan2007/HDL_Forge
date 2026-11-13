"use client";

/**
 * Client-side progress store. Persists lesson/pset completion in
 * localStorage so progress survives reloads without an account. Keys use the
 * same `chapter:slug` shape as the curriculum accessors.
 *
 * Remote writes go through a tiny outbox: a write that fails to reach the
 * server is parked in `hdlforge:progress:pq` and retried on network-online,
 * tab-visible, periodic tick, and next sign-in, so a dropped request never
 * silently loses the write.
 */

export type ProgressRecord = {
  completedAt: number;
  kind: "lesson" | "pset";
  score?: number | null;
  total?: number | null;
  points?: number | null;
  receipt?: string | null;
};

export type ProgressMap = Record<string, ProgressRecord>;

const STORAGE_KEY = "hdlforge:progress:v1";
const OUTBOX_KEY = "hdlforge:progress:pq";
const CHANGE_EVENT = "hdlforge:progress-changed";
const OUTBOX_MAX = 50;
const RETRY_TICK_MS = 60_000;

/** One parked remote write: the exact payload /api/progress expects. */
export type PendingWrite = {
  key: string;
  kind: "lesson" | "pset";
  score?: number;
  total?: number;
  points?: number;
  receipt?: string;
  queuedAt: number;
};

/**
 * Whether completions should also be POSTed to the account. Enabled only
 * after a session is proven (see ProgressSync) so anonymous users never fire
 * doomed requests that 401 in the console.
 */
let remoteSync = false;

export function setRemoteSync(enabled: boolean) {
  remoteSync = enabled;
  if (enabled) scheduleFlush(0);
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readProgress(): ProgressMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: ProgressMap = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (
        value &&
        typeof value === "object" &&
        typeof (value as ProgressRecord).completedAt === "number" &&
        ((value as ProgressRecord).kind === "lesson" ||
          (value as ProgressRecord).kind === "pset")
      ) {
        const v = value as ProgressRecord;
        out[key] = {
          completedAt: v.completedAt,
          kind: v.kind,
          ...(typeof v.score === "number" ? { score: v.score } : {}),
          ...(typeof v.total === "number" ? { total: v.total } : {}),
          ...(typeof v.points === "number" ? { points: v.points } : {}),
          ...(typeof v.receipt === "string" ? { receipt: v.receipt } : {}),
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

function readOutbox(): PendingWrite[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is PendingWrite =>
        w &&
        typeof w === "object" &&
        typeof (w as PendingWrite).key === "string" &&
        typeof (w as PendingWrite).queuedAt === "number",
    );
  } catch {
    return [];
  }
}

function writeOutbox(queue: PendingWrite[]) {
  if (!isBrowser()) return;
  try {
    if (queue.length === 0) {
      localStorage.removeItem(OUTBOX_KEY);
    } else {
      // Hard cap so a long offline stretch cannot balloon storage.
      localStorage.setItem(
        OUTBOX_KEY,
        JSON.stringify(queue.slice(-OUTBOX_MAX)),
      );
    }
  } catch {
    /* storage full — the local progress map itself is authoritative */
  }
}

export function clearOutbox() {
  writeOutbox([]);
}

let flushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced flush; delayMs=0 fires on the next task tick. */
function scheduleFlush(delayMs = RETRY_TICK_MS) {
  if (!isBrowser() || flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    if (readOutbox().length > 0) void flushOutbox();
  }, delayMs);
}

/**
 * Retry every parked write, oldest first. Each item that the server accepts
 * is removed; items still failing stay parked. Serialized so order is kept.
 */
export async function flushOutbox(): Promise<void> {
  if (!isBrowser() || !remoteSync || flushing) return;
  flushing = true;
  try {
    for (;;) {
      const queue = readOutbox();
      if (queue.length === 0) return;
      const item = queue[0];
      // JSON.stringify drops undefined fields, so this is exactly the
      // payload /api/progress expects.
      const payload = {
        key: item.key,
        kind: item.kind,
        score: item.score,
        total: item.total,
        points: item.points,
        receipt: item.receipt,
      };
      let ok = false;
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // 4xx other than 429 means the payload itself is rejected — drop it
        // rather than retry forever. 429/5xx/network stay queued.
        ok = res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429);
      } catch {
        ok = false;
      }
      if (ok) {
        writeOutbox(readOutbox().slice(1));
        continue;
      }
      scheduleFlush(RETRY_TICK_MS);
      return;
    }
  } finally {
    flushing = false;
  }
}

/** Park a write for later retry (latest write wins for the same key). */
function enqueueWrite(write: Omit<PendingWrite, "queuedAt">) {
  if (!isBrowser()) return;
  const queue = readOutbox().filter((w) => w.key !== write.key);
  queue.push({ ...write, queuedAt: Date.now() });
  writeOutbox(queue);
  scheduleFlush(0);
}

if (isBrowser()) {
  window.addEventListener("online", () => scheduleFlush(0));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleFlush(0);
  });
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export function markComplete(
  key: string,
  kind: "lesson" | "pset",
  extras?: {
    score?: number;
    total?: number;
    points?: number;
    receipt?: string;
  },
): ProgressMap {
  if (!isBrowser()) return {};
  const prev = readProgress();
  const already = prev[key];
  const next: ProgressMap = already
    ? { ...prev, [key]: { ...already, ...extras } }
    : { ...prev, [key]: { completedAt: Date.now(), kind, ...extras } };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedSnapshot = next;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    return prev;
  }
  // Remote write, only when a session has been proven — the merge on
  // sign-in already carries everything otherwise. Failure parks the write
  // in the outbox instead of losing it.
  if (remoteSync) {
    const write = { key, kind, ...extras };
    try {
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(write),
      }).then((res) => {
        if (res.ok) return;
        // 4xx other than 429: server rejected the payload — don't park it.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) return;
        enqueueWrite(write);
      });
    } catch {
      enqueueWrite(write);
    }
  }
  return next;
}

/**
 * Merge a server-fetched map into local state. Server rows win on conflicts,
 * except a signed receipt the server row lacks — receipts are the
 * certificate currency and must never be clobbered by an unscored row.
 */
export function cacheServerProgress(serverMap: ProgressMap): ProgressMap {
  if (!isBrowser()) return serverMap;
  const prev = readProgress();
  const merged: ProgressMap = { ...prev };
  for (const [key, value] of Object.entries(serverMap)) {
    const local = prev[key];
    merged[key] =
      local && local.receipt && !value.receipt
        ? { ...value, receipt: local.receipt }
        : value;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    cachedSnapshot = merged;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
  return merged;
}

/** Push the whole local map up to the account (run on sign-in). Returns true when the server accepted it. */
export async function pushLocalToServer(): Promise<boolean> {
  const local = readProgress();
  try {
    const res = await fetch("/api/progress/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: local }),
    });
    if (!res.ok) return false;
  } catch {
    return false;
  }
  // The merge upserted everything local (receipts included), so nothing
  // remains parked that the server hasn't seen.
  clearOutbox();
  try {
    const res = await fetch("/api/progress", { method: "GET" });
    if (!res.ok) return false;
    const data = (await res.json()) as { progress?: ProgressMap };
    if (data.progress) cacheServerProgress(data.progress);
    return true;
  } catch {
    return false;
  }
}

export function isComplete(key: string): boolean {
  return Boolean(readProgress()[key]);
}

export function subscribeProgress(onChange: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Fraction (0-1) of the given item keys completed. */
export function completionRatio(keys: string[], progress: ProgressMap): number {
  if (keys.length === 0) return 0;
  let done = 0;
  for (const key of keys) if (progress[key]) done++;
  return done / keys.length;
}

const EMPTY_PROGRESS: ProgressMap = {};
let cachedSnapshot: ProgressMap | null = null;

/** Stable snapshot for useSyncExternalStore. Cached between mutations. */
export function getProgressSnapshot(): ProgressMap {
  if (!isBrowser()) return EMPTY_PROGRESS;
  if (!cachedSnapshot) cachedSnapshot = readProgress();
  return cachedSnapshot;
}

export function getServerProgressSnapshot(): ProgressMap {
  return EMPTY_PROGRESS;
}

if (isBrowser()) {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null) cachedSnapshot = null;
  });
}
