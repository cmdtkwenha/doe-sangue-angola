import {
  permissionMatrix,
  protectedRouteRules,
  type PermissionArea
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  hospital: "Hospital",
  donor: "Dador"
};

const areaLabels: Record<PermissionArea, string> = {
  adminData: "Dados nacionais",
  auditLogs: "Auditoria",
  donorData: "Dados do dador",
  hospitalData: "Dados hospitalares",
  notifications: "Notificações"
};

export function PermissionMatrix() {
  return (
    <section className="panel">
      <div className="eyebrow">Segurança</div>
      <h2>Matriz de permissões</h2>
      <div className="grid metrics">
        {Object.entries(permissionMatrix).map(([area, roles]) => (
          <article className="panel" key={area}>
            <strong>{areaLabels[area as PermissionArea]}</strong>
            <p className="muted">
              {roles.map((role) => roleLabels[role]).join(", ")}
            </p>
          </article>
        ))}
      </div>
      <h3>Rotas protegidas</h3>
      <ul>
        {protectedRouteRules.map((rule) => (
          <li key={rule.path}>
            <strong>{rule.path}</strong> · {rule.roles.map((role) => roleLabels[role]).join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
