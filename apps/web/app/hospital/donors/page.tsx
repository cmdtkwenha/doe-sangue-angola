import { DonorArrivalCard } from "../../components/hospital/DonorArrivalCard";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { IncomingDonorsList } from "../../components/hospital/IncomingDonorsList";

export default function HospitalDonorsPage() {
  return (
    <HospitalSectionPage title="Dadores Recebidos">
      <section className="grid">
        <IncomingDonorsList />
        <DonorArrivalCard />
      </section>
    </HospitalSectionPage>
  );
}
