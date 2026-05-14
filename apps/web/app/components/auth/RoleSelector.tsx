"use client";

import type { UserRole } from "@doe-sangue-angola/shared-types";
import styles from "./auth.module.css";

const roles: Array<[UserRole, string, string]> = [
  ["admin", "Admin", "Centro nacional"],
  ["hospital", "Hospital/Clínica", "Operação clínica"],
  ["donor", "Dador", "App mobile"]
];

export function RoleSelector({
  role,
  setRole
}: {
  role: UserRole;
  setRole: (role: UserRole) => void;
}) {
  return (
    <div aria-label="Escolha o tipo de conta" className={styles.roles} role="radiogroup">
      {roles.map(([id, title, subtitle]) => (
        <button
          aria-checked={role === id}
          className={`${styles.role} ${role === id ? styles.active : ""}`}
          onClick={() => setRole(id)}
          role="radio"
          type="button"
          key={id}
        >
          {title}
          <br />
          <small>{subtitle}</small>
        </button>
      ))}
    </div>
  );
}
