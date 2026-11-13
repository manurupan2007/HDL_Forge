import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";

export type ProgressRecordIn = {
  kind?: "lesson" | "pset";
  score?: number | null;
  total?: number | null;
  points?: number | null;
  receipt?: string | null;
};

export type ServerProgressRow = {
  itemKey: string;
  kind: "lesson" | "pset";
  completedAt: Date | null;
  score: number | null;
  total: number | null;
  points: number | null;
  receipt: string | null;
};

export async function getProgressForUser(
  userId: string,
): Promise<ServerProgressRow[]> {
  return db
    .select({
      itemKey: lessonProgress.itemKey,
      kind: lessonProgress.kind,
      completedAt: lessonProgress.completedAt,
      score: lessonProgress.score,
      total: lessonProgress.total,
      points: lessonProgress.points,
      receipt: lessonProgress.receipt,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}

/**
 * Upsert a completion. Existing rows keep the original timestamp and are
 * only overwritten when a better score (or any pset details) arrives.
 */
export async function upsertProgressForUser(
  userId: string,
  itemKey: string,
  record: ProgressRecordIn,
) {
  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.itemKey, itemKey),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        score: record.score ?? existing.score,
        total: record.total ?? existing.total,
        points: record.points ?? existing.points,
        receipt: record.receipt ?? existing.receipt,
      })
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.itemKey, itemKey),
        ),
      );
    return existing;
  }

  await db.insert(lessonProgress).values({
    userId,
    itemKey,
    kind: record.kind ?? "lesson",
    score: record.score ?? null,
    total: record.total ?? null,
    points: record.points ?? null,
    receipt: record.receipt ?? null,
  });
  return null;
}

/**
 * Merge a client's stored map up to the server. Rows the server lacks are
 * inserted; rows the server already has are left alone (server wins) —
 * EXCEPT where the server row is missing data the local row carries: a
 * signed receipt (the certificate currency) or score details. A receipt the
 * server already has always wins over a local one.
 */
export async function mergeProgressForUser(
  userId: string,
  map: Record<
    string,
    {
      completedAt: number;
      kind: "lesson" | "pset";
      score?: number | null;
      total?: number | null;
      points?: number | null;
      receipt?: string;
    }
  >,
) {
  const keys = Object.keys(map);
  if (keys.length === 0) return;

  const existing = await db
    .select({
      itemKey: lessonProgress.itemKey,
      receipt: lessonProgress.receipt,
      score: lessonProgress.score,
      total: lessonProgress.total,
      points: lessonProgress.points,
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.itemKey, keys),
      ),
    );
  const existingMap = new Map(existing.map((r) => [r.itemKey, r]));

  const missing = keys
    .filter((k) => !existingMap.has(k))
    .map((k) => ({
      userId,
      itemKey: k,
      kind: map[k].kind,
      completedAt: new Date(map[k].completedAt),
      score: map[k].score ?? null,
      total: map[k].total ?? null,
      points: map[k].points ?? null,
      receipt: map[k].receipt ?? null,
    }));

  if (missing.length > 0) {
    await db.insert(lessonProgress).values(missing);
  }

  // Backfill gaps only — never overwrite an existing receipt or score.
  const patch = keys.filter((k) => {
    const row = existingMap.get(k);
    if (!row) return false;
    const local = map[k];
    return (
      (!row.receipt && Boolean(local.receipt)) ||
      (row.score == null && local.score != null)
    );
  });
  for (const k of patch) {
    const row = existingMap.get(k);
    const local = map[k];
    if (!row) continue;
    await db
      .update(lessonProgress)
      .set({
        receipt: local.receipt ?? row.receipt,
        score: row.score ?? local.score ?? null,
        total: row.total ?? local.total ?? null,
        points: row.points ?? local.points ?? null,
      })
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.itemKey, k),
        ),
      );
  }
}
