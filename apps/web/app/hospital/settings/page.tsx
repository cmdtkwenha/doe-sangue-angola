import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { HospitalSettingsEditor } from "../../components/hospital/HospitalSettingsEditor";

export default function HospitalSettingsPage() {
  return (
    <HospitalSectionPage title="Definições">
      <HospitalSettingsEditor />
    </HospitalSectionPage>
  );
}
