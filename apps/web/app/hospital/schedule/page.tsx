import { AppointmentSchedule } from "../../components/hospital/AppointmentSchedule";
import { AppointmentConfirmation } from "../../components/hospital/automation/AppointmentConfirmation";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";

export default function HospitalSchedulePage() {
  return (
    <HospitalSectionPage title="Agendamentos">
      <section className="grid">
        <AppointmentSchedule />
        <AppointmentConfirmation />
      </section>
    </HospitalSectionPage>
  );
}
