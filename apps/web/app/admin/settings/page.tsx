import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { SettingsSection } from "../../components/settings/SettingsSection";
import { settingsData } from "../../components/settings/settingsData";

export default function AdminSettingsPage() {
  return (
    <AdminManagementPage kicker="Plataforma" title="Definições">
      <section className="grid">
        {settingsData.admin.map((section) => (
          <SettingsSection key={section.title} section={section} />
        ))}
      </section>
    </AdminManagementPage>
  );
}
