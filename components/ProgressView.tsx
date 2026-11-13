"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { type Chapter, TRACK_TITLE } from "@/lib/curriculum";
import { authClient } from "@/lib/auth-client";
import {
  completionRatio,
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { ProgressBar } from "./ProgressBar";

type ProgressViewProps = {
  chapters: Chapter[];
};

function pct(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

export function ProgressView({ chapters }: ProgressViewProps) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const perChapter = useMemo(
    () =>
      chapters.map((c) => {
        const keys = [
          ...c.lessons.map((l) => `${c.slug}:${l.slug}`),
          `${c.slug}:${c.pset.slug}`,
        ];
        return { chapter: c, keys, ratio: completionRatio(keys, progress) };
      }),
    [chapters, progress],
  );

  const trackKeys = perChapter.flatMap((c) => c.keys);
  const trackRatio = completionRatio(trackKeys, progress);
  const doneCount = Object.keys(progress).length;
  const totalPoints = Object.values(progress).reduce(
    (sum, r) => sum + (typeof r.points === "number" ? r.points : 0),
    0,
  );
  const signedIn = Boolean(session?.user);

  return (
    <>
      <div className="card mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-fg-muted">
              {doneCount > 0
                ? `${doneCount} item${doneCount === 1 ? "" : "s"} completed`
                : "No progress yet"}
              {totalPoints > 0 && (
                <span className="ml-2 font-mono text-[13px] text-accent-bright">
                  {totalPoints} pts
                </span>
              )}
            </p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-fg-muted">
              {signedIn
                ? "Progress is saved to your account and follows you across devices."
                : "Progress is saved in this browser as you pass lessons and problem sets — no account needed."}{" "}
              Complete every problem set to earn the certificate.
            </p>
            {!signedIn && !sessionPending && doneCount > 0 && (
              <Link
                href="/signin"
                className="mt-2 inline-block text-[13px] font-medium text-accent-bright hover:underline"
              >
                Sign in with Google to back it up →
              </Link>
            )}
          </div>
          <Link href="/learn" className="btn btn-primary">
            Go to the track
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight">
          Certifications
        </h2>
        <div className="card mt-3 p-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-fg">{TRACK_TITLE}</h3>
              <p className="mt-0.5 text-xs text-fg-subtle">
                {trackKeys.length} items · certificate at the end
              </p>
            </div>
            <div className="w-36 shrink-0">
              <ProgressBar value={trackRatio} />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-fg-subtle">
              {pct(trackRatio)}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight">
          Track progress
        </h2>
        <div className="mt-3 flex flex-col gap-1.5">
          {perChapter.map(({ chapter: c, keys, ratio }) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="card card-hover flex items-center gap-4 px-4 py-3"
            >
              <span className="w-14 shrink-0 font-mono text-xs text-fg-subtle">
                CH {String(c.number).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-fg-muted">
                {c.title}
              </span>
              <div className="w-28 shrink-0">
                <ProgressBar value={ratio} />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-fg-subtle">
                {pct(ratio)}
              </span>
              <span className="hidden w-16 shrink-0 text-right font-mono text-[11px] text-fg-subtle sm:inline">
                {keys.filter((k) => progress[k]).length}/{keys.length}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
