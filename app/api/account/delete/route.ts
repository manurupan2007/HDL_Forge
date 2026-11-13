import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Account self-deletion (GDPR/FERPA credibility).
 *
 * Delegates to Better Auth's /delete-user endpoint, which removes the user
 * row and cascades sessions, OAuth accounts and lesson_progress (the DB
 * foreign keys are ON DELETE cascade). Requires a "fresh" session —
 * OAuth-only users have no password, so a stale session asks them to sign
 * in again rather than demanding a password they don't have.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "delete-account");
  if (limited) return limited;

  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return Response.json({ error: "auth not configured" }, { status: 503 });
  }
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await auth.api.deleteUser({ headers: await headers(), body: {} });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Stale session (freshAge window passed) and no password to re-check.
    if (/session expired|fresh/i.test(message)) {
      return Response.json(
        {
          error:
            "session-not-fresh — sign out, sign in again, then confirm deletion",
        },
        { status: 409 },
      );
    }
    console.error("[account/delete] failed", err);
    return Response.json({ error: "deletion failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
