import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getProgressForUser,
  upsertProgressForUser,
} from "@/lib/server/progress";

export async function GET() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return NextResponse.json({ progress: {} });
  }
  if (!session) return NextResponse.json({ progress: {} });

  const rows = await getProgressForUser(session.user.id);
  const progress: Record<
    string,
    { completedAt: number; kind: string; receipt?: string }
  > = {};
  for (const row of rows) {
    progress[row.itemKey] = {
      completedAt: row.completedAt
        ? row.completedAt.getTime()
        : Date.now(),
      kind: row.kind,
      ...(row.score != null ? { score: row.score } : {}),
      ...(row.total != null ? { total: row.total } : {}),
      ...(row.points != null ? { points: row.points } : {}),
      ...(row.receipt ? { receipt: row.receipt } : {}),
    };
  }
  return NextResponse.json({ progress });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return NextResponse.json({ error: "auth not configured" }, { status: 503 });
  }
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as {
    key?: unknown;
    kind?: unknown;
    score?: unknown;
    total?: unknown;
    points?: unknown;
    receipt?: unknown;
  };

  if (typeof b.key !== "string" || b.key.length === 0 || b.key.length > 200) {
    return NextResponse.json({ error: "bad key" }, { status: 400 });
  }
  if (b.kind !== "lesson" && b.kind !== "pset") {
    return NextResponse.json({ error: "bad kind" }, { status: 400 });
  }

  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  try {
    await upsertProgressForUser(session.user.id, b.key, {
      kind: b.kind,
      score: num(b.score),
      total: num(b.total),
      points: num(b.points),
      receipt:
        typeof b.receipt === "string" && b.receipt.length < 10_000
          ? b.receipt
          : null,
    });
  } catch (err) {
    console.error("[progress] upsert failed", err);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
