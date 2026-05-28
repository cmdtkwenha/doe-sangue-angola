import { AppointmentSchedule } from "../../components/hospital/AppointmentSchedule";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";

export default function HospitalSchedulePage() {
  return (
    <HospitalSectionPage title="Agendamentos">
      <section className="grid">
        <AppointmentSchedule />
      </section>
    </HospitalSectionPage>
  );
}
