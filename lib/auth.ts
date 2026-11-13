import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24; // refresh the 30-day clock daily

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    // Freshness window for sensitive operations (account deletion): a
    // session created within this span may delete the account without a
    // password re-check.
    freshAge: 60 * 60 * 24,
  },
  // Land OAuth failures back on the sign-in page (?error=<code>) so the UI
  // can show a friendly explanation instead of a bare /error page.
  onAPIError: {
    errorURL: "/signin",
  },
  advanced: {
    // Better Auth sends Secure cookies automatically once BETTER_AUTH_URL
    // is an https URL; deriving it explicitly here guarantees the cookie
    // flag matches the configured origin even if detection changes.
    useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith("https") ?? false,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
