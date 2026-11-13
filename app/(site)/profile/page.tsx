import { chapters } from "@/lib/curriculum";
import { ProgressView } from "@/components/ProgressView";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow">Profile</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your progress</h1>

      <ProgressView chapters={chapters} />

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Danger zone</h2>
        <div className="card mt-3 p-5">
          <p className="text-sm font-semibold text-fg">Delete this account</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
            Removes your {SITE_NAME} account and every row stored for it —
            progress, scores, receipts and certificates — immediately and
            permanently. See the{" "}
            <a href="/privacy" className="underline">
              privacy policy
            </a>{" "}
            for what is stored and why.
          </p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  );
}