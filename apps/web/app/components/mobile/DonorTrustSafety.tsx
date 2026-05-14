import { ConsentManager } from "./ConsentManager";
import { EmergencyContactsPanel } from "./EmergencyContactsPanel";
import { MedicalDisclaimerScreen } from "./MedicalDisclaimerScreen";
import { MobileShell } from "./MobileShell";
import { NotificationSettings } from "./NotificationSettings";
import { PrivacySettings } from "./PrivacySettings";
import { ReportIssueForm } from "./ReportIssueForm";
import { VerificationBadge } from "./VerificationBadge";

export function DonorTrustSafety() {
  return (
    <MobileShell active="profile">
      <header>
        <strong>Confiança e Segurança</strong>
        <p className="muted">Privacidade, consentimento e apoio ao dador.</p>
        <VerificationBadge />
      </header>
      <MedicalDisclaimerScreen />
      <PrivacySettings />
      <NotificationSettings />
      <ConsentManager />
      <EmergencyContactsPanel />
      <ReportIssueForm />
    </MobileShell>
  );
}
