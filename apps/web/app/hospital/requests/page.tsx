import { ActiveRequestsTable } from "../../components/hospital/ActiveRequestsTable";
import { RequestStatusTimeline } from "../../components/workflow/RequestStatusTimeline";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";

export default function HospitalRequestsPage() {
  return (
    <HospitalSectionPage title="Pedidos de Sangue">
      <section className="grid">
        <ActiveRequestsTable />
        <RequestStatusTimeline />
      </section>
    </HospitalSectionPage>
  );
}
