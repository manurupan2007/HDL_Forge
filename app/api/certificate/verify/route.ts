import { NextRequest } from "next/server";
import { verifyCertificate } from "@/lib/server/certs";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return Response.json({ valid: false, reason: "missing token" }, { status: 400 });
  }
  const result = verifyCertificate(token);
  return Response.json(result, { status: result.valid ? 200 : 400 });
}