"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { pushLocalToServer, setRemoteSync } from "@/lib/progress";

/**
 * Watches the auth session and, whenever the signed-in user changes,
 * merges any device-local progress up to their account and then pulls the
 * authoritative server state back into the local cache.
 */
export function ProgressSync() {
  const { data, isPending } = authClient.useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    const userId = data?.user?.id ?? null;
    if (userId && userId !== lastUserId.current) {
      lastUserId.current = userId;
      void pushLocalToServer().then((ok) => {
        if (ok) setRemoteSync(true);
      });
    } else if (!userId) {
      lastUserId.current = null;
      setRemoteSync(false);
    }
  }, [data, isPending]);

  return null;
}
