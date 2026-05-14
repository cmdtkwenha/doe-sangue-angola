import { NotificationCenter } from "../notifications/NotificationCenter";
import { MobileShell } from "./MobileShell";

export function DonorNotifications() {
  return (
    <MobileShell active="home">
      <header>
        <strong>Notificações</strong>
        <p className="muted">Alertas de sangue, lembretes e agendamentos.</p>
      </header>
      <NotificationCenter />
    </MobileShell>
  );
}
