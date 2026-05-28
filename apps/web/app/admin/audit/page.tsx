import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { AuditLogsTable } from "../../components/admin/management/AuditLogsTable";
import { ComplianceAuditPanel } from "../../components/admin/compliance";
import { ConsentAuditPanel } from "../../components/admin/compliance/ConsentAuditPanel";

export default function AuditPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Auditoria e Logs">
      <ComplianceAuditPanel />
      <ConsentAuditPanel />
      <AuditLogsTable />
    </AdminManagementPage>
  );
}
