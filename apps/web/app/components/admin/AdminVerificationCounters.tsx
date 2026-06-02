"use client";

import Link from "next/link";
import type { Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import styles from "./adminCore.module.css";

type UserRow = { account_status?: string; id: string };
type UsersPayload = { users: UserRow[] };

export function AdminVerificationCounters() {
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", [], 0);
  const { data: donors } = useApiData<Donor[]>("/api/donors", [], 0);
  const { data: users } = useApiData<UsersPayload>("/api/admin/users", { users: [] }, 0);
  const hospitalPending = hospitals.filter((item) => ["pending", "needs_review"].includes(status(item))).length;
  const donorPending = donors.filter((item) => ["needs_review", "pending_verification"].includes(String(item.eligibilityStatus))).length;
  const suspended = users.users.filter((item) => item.account_status === "Suspenso" || item.account_status === "suspended").length;
  const cards = [
    ["Hospitais pendentes", hospitalPending, "/admin/verification"],
    ["Dadores pendentes", donorPending, "/admin/verification"],
    ["Casos de verificação", hospitalPending + donorPending, "/admin/verification"],
    ["Utilizadores suspensos", suspended, "/admin/users"]
  ] as const;
  return (
    <section className={styles.metricGrid}>
      {cards.map(([label, value, href]) => (
        <Link className={styles.metricLink} href={href} key={label}>
          <span className="muted">{label}</span>
          <strong>{value}</strong>
        </Link>
      ))}
    </section>
  );
}

function status(hospital: Hospital) {
  return String(hospital.verificationStatus ?? (hospital.verified ? "verified" : "pending"));
}
