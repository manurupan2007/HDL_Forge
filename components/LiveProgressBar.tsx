"use client";

import { useSyncExternalStore } from "react";
import {
  completionRatio,
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { ProgressBar } from "@/components/ProgressBar";

/** Live lesson/pset completion ratio for the given keys. SSR-safe. */
export function LiveProgressBar({ keys }: { keys: string[] }) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  return <ProgressBar value={completionRatio(keys, progress)} />;
}

export function LiveProgressLabel({
  keys,
  suffix,
}: {
  keys: string[];
  suffix?: string;
}) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const ratio = completionRatio(keys, progress);
  const pct = Math.round(ratio * 100);
  return (
    <span className="text-[11px] text-fg-subtle">
      {pct}%{ratio === 1 ? " · complete" : ratio === 0 ? " · not started" : ""}
      {suffix ? ` · ${suffix}` : ""}
    </span>
  );
}
