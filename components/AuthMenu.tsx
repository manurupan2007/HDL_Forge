"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { setRemoteSync } from "@/lib/progress";

export function AuthMenu() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data) setRemoteSync(false);
  }, [data, isPending]);

  if (isPending) {
    return (
      <span className="btn-secondary btn pointer-events-none px-4 py-1.5 text-[13px] opacity-50">
        …
      </span>
    );
  }

  if (data?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/profile" className="text-[13px] text-fg-muted hover:text-fg">
          {data.user.name?.split(" ")[0] ?? data.user.email}
        </Link>
        <button
          className="btn-secondary btn px-4 py-1.5 text-[13px]"
          onClick={() =>
            void authClient.signOut({
              fetchOptions: {
                onSuccess: () => router.replace("/"),
              },
            })
          }
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/signin" className="btn-secondary btn px-4 py-1.5 text-[13px]">
      Sign in
    </Link>
  );
}
