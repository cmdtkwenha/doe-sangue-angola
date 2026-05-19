"use client";

import { DigitalDonorCard } from "./DigitalDonorCard";
import { DonationSummaryCard } from "./DonationSummaryCard";
import { EmergencyContactCard } from "./EmergencyContactCard";
import { MobileShell } from "./MobileShell";
import { ProfileProgress } from "./ProfileProgress";
import profile from "./mobileProfile.module.css";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { isDonorProfileComplete, useCurrentDonor } from "./useCurrentDonor";
import { VerificationBadge } from "./VerificationBadge";

export function DonorProfile() {
  const { data: donor, loading } = useCurrentDonor();

  if (loading) {
    return <MobileShell active="profile"><LoadingSkeleton label="A carregar perfil real" /></MobileShell>;
  }

  if (!isDonorProfileComplete(donor)) {
    return (
      <MobileShell active="profile">
        <EmptyState
          message="Complete o onboarding para criar o seu perfil Supabase."
          title="Perfil de dador em falta"
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell active="profile">
      <header className={profile.profileHead}>
        <div className={profile.avatar}>{initials(donor.name)}</div>
        <span>
          <strong>{donor.name}</strong>
          <br />
          <small className="muted">{donor.phone || "Telefone por completar"}</small>
          <br />
          <VerificationBadge />
        </span>
      </header>
      <DigitalDonorCard donor={donor} />
      <ProfileProgress donor={donor} />
      <DonationSummaryCard donor={donor} />
      <EmergencyContactCard donor={donor} />
    </MobileShell>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((item) => item[0]).join("").toUpperCase();
}
