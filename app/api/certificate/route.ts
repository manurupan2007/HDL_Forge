import { NextRequest } from "next/server";
import { chapters, TRACK_TITLE } from "@/lib/curriculum";
import { issueCertificate, verifyReceipt } from "@/lib/server/certs";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { name, receipts } = body as { name?: string; receipts?: string[] };

  const cleanName = (name ?? "").trim().replace(/\s+/g, " ");
  if (cleanName.length < 3 || cleanName.length > 60) {
    return Response.json(
      { error: "name must be between 3 and 60 characters" },
      { status: 400 },
    );
  }
  if (!Array.isArray(receipts)) {
    return Response.json({ error: "receipts must be an array" }, { status: 400 });
  }

  const expected = new Map<string, boolean>();
  for (const c of chapters) expected.set(`${c.slug}:${c.pset.slug}`, false);

  let cleared = 0;
  for (const token of receipts) {
    const receipt = verifyReceipt(token);
    if (!receipt || !receipt.passedAll) continue;
    const key = `${receipt.chapterSlug}:${receipt.psetSlug}`;
    if (!expected.has(key) || expected.get(key)) continue; // unknown or duplicate
    expected.set(key, true);
    cleared += 1;
  }

  if (cleared !== chapters.length) {
    return Response.json(
      { error: `not all 15 problem sets cleared (${cleared}/${chapters.length})` },
      { status: 409 },
    );
  }

  const payload = {
    v: 1,
    name: cleanName,
    issuedAt: new Date().toISOString(),
    track: "hdlforge-v1",
    cleared,
    totalPsets: chapters.length,
  } as const;

  return Response.json({
    token: issueCertificate(payload),
    payload,
    trackTitle: TRACK_TITLE,
  });
}