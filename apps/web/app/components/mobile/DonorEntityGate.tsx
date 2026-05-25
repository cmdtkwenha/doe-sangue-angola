"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { isDonorProfileComplete, useCurrentDonor } from "./useCurrentDonor";

export function DonorEntityGate({ children }: { children: ReactNode }) {
  const { data: donor, loading } = useCurrentDonor();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isDonorProfileComplete(donor)) router.replace("/onboarding/donor");
  }, [donor, loading, router]);

  if (loading) {
    return (
      <MobileShell active="profile">
        <LoadingSkeleton label="A carregar perfil do dador" />
      </MobileShell>
    );
  }

  if (!isDonorProfileComplete(donor)) {
    return (
      <MobileShell active="profile">
        <EmptyState
          message="A sua conta existe, mas o perfil de dador ainda não foi criado."
          title="Perfil ainda não configurado."
        />
      </MobileShell>
    );
  }

  return <>{children}</>;
}
