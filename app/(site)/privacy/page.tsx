import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What HDL Forge stores, why, and how to delete it. No advertising, no trackers, no third-party cookies.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "What we store",
    body: [
      "When you sign in with Google we store your name, email address, profile image URL, and your Google account's provider-side ID — nothing more from your Google profile.",
      "As you use the platform we store your learning progress: which lessons and problem sets you completed, when you completed them, your per-problem-set scores, and the signed receipts that back your certificate. These rows are tied to your account ID.",
      "Each browser session stores a single session cookie (\"better-auth.session_token\") so you stay signed in. It contains a random session identifier — nothing else. We use no advertising cookies, no analytics cookies, and no cross-site tracking.",
    ],
  },
  {
    title: "Anonymous use",
    body: [
      "You can use the entire curriculum without an account. In that mode your progress is stored only in your browser's localStorage on your own device — it is never transmitted to us, and clearing your browser data removes it permanently.",
      "Progress saved this way only reaches our servers when you sign in and explicitly merge it into your account.",
    ],
  },
  {
    title: "Google OAuth",
    body: [
      "Sign-in is delegated to Google (\"Sign in with Google\"). We request the default openid, email, and profile scopes only — we never post on your behalf, read your contacts, or access anything beyond the profile fields above.",
      "Google handles the authentication step; we receive only the minimal profile data needed to create your account.",
    ],
  },
  {
    title: "Infrastructure processors",
    body: [
      "The site is hosted on Vercel (web hosting), with a managed Postgres database (Neon) storing the account rows described above. Crash reports go to Sentry only when an unexpected error occurs, and they are scrubbed of personal data to the extent the crash allows. Email is not used for notifications — we send no marketing email and do not sell or share your data with advertisers.",
    ],
  },
  {
    title: "How to delete your data",
    body: [
      "Sign in, open your Profile page, and use \"Delete account…\" in the Danger zone. Deletion is immediate and permanent: it removes your account, sign-in sessions, OAuth link, and every progress row including receipts and certificates.",
      "If you used the platform anonymously, your data lives only in your browser — clear the site's localStorage (or your browser data) and nothing remains.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Privacy policy
      </h1>
      <p className="mt-3 text-[13px] text-fg-subtle">
        Last updated: October 2026 · Applies to hdlforge.dev
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
        Short version: we store the minimum needed to run a learning platform —
        your Google profile basics and your progress. No ads, no trackers, no
        data sales. You can delete everything yourself, in one click, at any
        time.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
            <div className="mt-2 flex flex-col gap-3">
              {s.body.map((p, i) => (
                <p
                  key={i}
                  className="max-w-2xl text-sm leading-relaxed text-fg-muted"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
