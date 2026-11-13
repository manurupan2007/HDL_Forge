import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Server-side session resolver. Returns null instead of throwing when auth
 * is not configured (e.g. DATABASE_URL missing during early setup).
 */
export async function getServerSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}
