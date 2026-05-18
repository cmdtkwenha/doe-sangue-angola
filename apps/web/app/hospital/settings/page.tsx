import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { SettingsSection } from "../../components/settings/SettingsSection";
import { settingsData } from "../../components/settings/settingsData";

export default function HospitalSettingsPage() {
  return (
    <HospitalSectionPage title="Definições">
      <section className="grid">
        {settingsData.hospital.map((section) => (
          <SettingsSection key={section.title} section={section} />
        ))}
      </section>
    </HospitalSectionPage>
  );
}
