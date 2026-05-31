"use client";

import Link from "next/link";
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
import { useAuth } from "../auth/useAuth";

export function DonorProfile() {
  const { session } = useAuth();
  const { data: donor, loading } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;

  if (loading) {
    return <MobileShell active="profile"><LoadingSkeleton label="A carregar perfil real" /></MobileShell>;
  }

  if (!isDonorProfileComplete(donor, userId)) {
    return (
      <MobileShell active="profile">
        <EmptyState
          action={<Link className="button" href="/mobile/onboarding">Completar perfil</Link>}
          message="Complete o onboarding para criar o seu perfil de dador."
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
      <article className={profile.panel}>
        <div className={profile.contact}>
          <strong>Dados do perfil</strong>
          <Link className="button secondary" href="/mobile/onboarding">Editar</Link>
        </div>
        <div className={profile.detailGrid}>
          <Detail label="Tipo sanguíneo" value={donor.bloodType} />
          <Detail label="Província" value={donor.province} />
          <Detail label="Município" value={donor.municipality} />
          <Detail label="Telefone" value={donor.phone} />
          <Detail label="Género" value={donor.gender} />
          <Detail label="Nascimento" value={donor.birthDate} />
          <Detail label="Contacto SOS" value={donor.emergencyContactName} />
          <Detail label="Telefone SOS" value={donor.emergencyContactPhone} />
          <Detail
            label="Consentimento"
            value={donor.consentAcceptedAt ? `Aceite (${donor.consentVersion ?? "versão atual"})` : "Pendente"}
          />
        </div>
      </article>
      <ProfileProgress donor={donor} />
      <DonationSummaryCard donor={donor} />
      <EmergencyContactCard donor={donor} />
    </MobileShell>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <span className={profile.detail}>
      <small>{label}</small>
      <strong>{value || "Por completar"}</strong>
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((item) => item[0]).join("").toUpperCase();
}
