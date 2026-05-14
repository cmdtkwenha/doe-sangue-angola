import { donors, getHospitalDashboard } from "@doe-sangue-angola/shared-services";
import styles from "./hospitalPortal.module.css";
import { currentHospitalId } from "./hospitalPortalData";

const donorById = new Map(donors.map((donor) => [donor.id, donor]));

export function AppointmentSchedule() {
  const appointments = getHospitalDashboard(currentHospitalId).appointments;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Agendamentos de Hoje</strong>
        <a className="muted" href="#">Ver calendário</a>
      </div>
      <div className={styles.table}>
        {appointments.map((appointment) => {
          const donor = donorById.get(appointment.donorId);
          return (
          <article className={styles.scheduleRow} key={appointment.id}>
            <span>{appointment.time}</span>
            <span>
              <strong>{donor?.name}</strong><br />
              <span className={styles.rowMuted}>{donor?.bloodType} · Doação</span>
            </span>
            <span className={appointment.status === "Pendente" ? "pill gold" : "pill"}>
              {appointment.status}
            </span>
          </article>
          );
        })}
      </div>
      <a className={styles.footerLink} href="#">Ver todos os agendamentos</a>
    </section>
  );
}
