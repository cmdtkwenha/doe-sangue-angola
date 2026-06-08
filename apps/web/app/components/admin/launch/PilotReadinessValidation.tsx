"use client";

import { useApiData } from "@hooks/useApiData";
import styles from "./pilotToolkit.module.css";

type ReadinessItem = { label: string; ok: boolean };
type ReadinessGroup = { items: ReadinessItem[]; label: string };
type Readiness = {
  groups: ReadinessGroup[];
  passed: number;
  score: "Atenção" | "Crítico" | "Pronto";
  total: number;
};

type Payload = { readiness?: Readiness };

const empty: Readiness = {
  groups: [],
  passed: 0,
  score: "Atenção",
  total: 0
};

export function PilotReadinessValidation() {
  const { data, error, loading } = useApiData<Payload>("/api/admin/pilot-toolkit", {});
  const readiness = data.readiness ?? empty;
  const percent = readiness.total ? Math.round((readiness.passed / readiness.total) * 100) : 0;

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div>
          <div className="eyebrow">Prontidão do Piloto</div>
          <h2>Validação para teste real</h2>
        </div>
        <div className={styles.scoreBox}>
          <span className={scoreClass(readiness.score)}>{loading ? "A verificar" : readiness.score}</span>
          <strong>{percent}%</strong>
          <small>{readiness.passed} de {readiness.total} critérios</small>
        </div>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      <div className={styles.grid}>
        {readiness.groups.map((group) => (
          <article className={styles.panel} key={group.label}>
            <strong>{group.label}</strong>
            <div className={styles.checks}>
              {group.items.map((item) => (
                <span key={item.label}>{item.ok ? "☑" : "☐"} {item.label}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function scoreClass(score: Readiness["score"]) {
  if (score === "Pronto") return "pill green";
  if (score === "Crítico") return "pill red";
  return "pill gold";
}
