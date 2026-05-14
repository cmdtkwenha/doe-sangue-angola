import { DigitalDonorCard } from "./DigitalDonorCard";
import { DonationSummaryCard } from "./DonationSummaryCard";
import { EmergencyContactCard } from "./EmergencyContactCard";
import { MobileShell } from "./MobileShell";
import { ProfileProgress } from "./ProfileProgress";
import profile from "./mobileProfile.module.css";
import { donor } from "./mobileMock";
import { VerificationBadge } from "./VerificationBadge";

export function DonorProfile() {
  return (
    <MobileShell active="profile">
      <header className={profile.profileHead}>
        <div className={profile.avatar}>MJ</div>
        <span>
          <strong>{donor.name}</strong>
          <br />
          <small className="muted">{donor.phone}</small>
          <br />
          <VerificationBadge />
        </span>
      </header>
      <DigitalDonorCard />
      <ProfileProgress />
      <DonationSummaryCard />
      <EmergencyContactCard />
    </MobileShell>
  );
}
