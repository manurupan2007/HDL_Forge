import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mergeProgressForUser } from "@/lib/server/progress";

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

  const map = (body as { progress?: unknown }).progress;
  if (!map || typeof map !== "object" || Array.isArray(map)) {
    return NextResponse.json({ error: "bad progress map" }, { status: 400 });
  }

  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1e6
      ? v
      : undefined;

  const clean: Record<
    string,
    {
      completedAt: number;
      kind: "lesson" | "pset";
      score?: number;
      total?: number;
      points?: number;
      receipt?: string;
    }
  > = {};
  for (const [key, value] of Object.entries(map as Record<string, unknown>)) {
    if (typeof key !== "string" || key.length === 0 || key.length > 200) continue;
    const v = value as {
      completedAt?: unknown;
      kind?: unknown;
      score?: unknown;
      total?: unknown;
      points?: unknown;
      receipt?: unknown;
    };
    if (
      v &&
      typeof v === "object" &&
      typeof v.completedAt === "number" &&
      (v.kind === "lesson" || v.kind === "pset")
    ) {
      clean[key] = {
        completedAt: v.completedAt,
        kind: v.kind,
        ...(num(v.score) !== undefined ? { score: num(v.score) } : {}),
        ...(num(v.total) !== undefined ? { total: num(v.total) } : {}),
        ...(num(v.points) !== undefined ? { points: num(v.points) } : {}),
        ...(typeof v.receipt === "string" && v.receipt.length < 10_000
          ? { receipt: v.receipt }
          : {}),
      };
    }
  }

  try {
    await mergeProgressForUser(session.user.id, clean);
  } catch (err) {
    console.error("[progress] merge failed", err);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
