import { SITE_NAME } from "@/lib/site";
import { SignInButton } from "@/components/SignInButton";

export const metadata = {
  title: "Sign in",
};

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    deleted?: string;
  }>;
};

/**
 * Better Auth redirects OAuth failures back here as `?error=<code>` (see
 * onAPIError.errorURL in lib/auth.ts). Map the known codes to plain language
 * instead of leaving users with a bare error.
 */
function friendlyError(error?: string): string | null {
  if (!error) return null;
  switch (error) {
    case "no_code":
    case "invalid_code":
    case "state_mismatch":
    case "nonce_binding_missing":
      return "Google returned an incomplete response. Please try signing in again.";
    case "oauth_provider_not_found":
    case "issuer_missing":
    case "issuer_mismatch":
    case "no_callback_url":
      return `Google sign-in isn't configured correctly on this deployment. Try again later or contact the maintainers.`;
    case "unable_to_get_user_info":
      return "We couldn't read your Google profile. Please try again.";
    case "email_not_found":
    case "email_not_verified":
      return `Your Google account doesn't share a verified email with us, which is required to save progress. Use a Google account with a verified email.`;
    case "email_does_not_match":
    case "account_already_linked_to_different_user":
    case "unable_to_link_account":
      return "This Google account is already linked to a different sign-in. Sign in with the account you originally used.";
    default:
      return "Sign-in didn't complete. Please try again — if it keeps failing, the deployment may be missing Google OAuth credentials.";
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error: oauthError, deleted } = await searchParams;
  const message = friendlyError(oauthError);

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <div className="card overflow-hidden">
        <div className="flex h-10 items-center border-b border-border-subtle px-5">
          <span className="text-sm font-semibold tracking-tight">
            {SITE_NAME}
          </span>
        </div>
        <div className="p-6">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Continue your forge across sessions and unlock the certificate.
          </p>

          {deleted === "1" && (
            <div
              role="status"
              className="mt-4 rounded-md border border-border-strong bg-canvas-inset px-3 py-2.5"
            >
              <p className="text-[13px] leading-relaxed text-fg-muted">
                Your account and all associated data have been deleted. You can
                start fresh whenever you like.
              </p>
            </div>
          )}

          {message && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-border-strong bg-canvas-inset px-3 py-2.5"
            >
              <p className="text-[13px] leading-relaxed text-red-400">
                {message}
              </p>
            </div>
          )}

          <div className="mt-6">
            <SignInButton />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-fg-subtle">
            Signing in saves your completion and scores to your account so they
            follow you across devices. Everything here also works anonymously —
            progress stays on this device until you sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
