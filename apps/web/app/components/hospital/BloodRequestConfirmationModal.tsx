"use client";

import type { BloodType, Urgency } from "@doe-sangue-angola/shared-types";
import { AccessibleModal } from "../accessibility";
import styles from "../ui/confirmation.module.css";

export type BloodRequestConfirmation = {
  bloodType: BloodType;
  currentStock?: number;
  minimumStock?: number;
  notes?: string;
  units: number;
  urgency: Urgency;
};

type Props = {
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  request: BloodRequestConfirmation | null;
};

export function BloodRequestConfirmationModal({ loading, onCancel, onConfirm, request }: Props) {
  if (!request) return null;
  const critical = request.urgency === "Critica";

  return (
    <AccessibleModal onClose={loading ? undefined : onCancel} title="Confirmar pedido de sangue">
      <div className={styles.body}>
        <div className={styles.header}>
          <span>
            <h3>Confirmar pedido de sangue</h3>
            <p className={styles.message}>
              Confirme os dados clínicos antes de notificar dadores compatíveis.
            </p>
          </span>
          <button
            aria-label="Fechar confirmação"
            className={styles.close}
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <Detail label="Tipo sanguíneo" value={request.bloodType} />
          <Detail label="Quantidade solicitada" value={`${request.units} bolsas`} />
          <Detail label="Prioridade" value={urgencyLabel(request.urgency)} />
          <Detail label="Stock atual" value={`${request.currentStock ?? 0} unidades`} />
          <Detail label="Stock mínimo" value={`${request.minimumStock ?? 0} unidades`} />
          <Detail label="Notas clínicas" value={request.notes?.trim() || "Sem notas clínicas"} />
        </div>
        {critical ? (
          <p className={styles.message} style={{ color: "#b10f1f", fontWeight: 900 }}>
            Pedido crítico: dadores compatíveis serão notificados imediatamente.
          </p>
        ) : null}
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.secondary}`} disabled={loading} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className={`${styles.button} ${styles.primary}`} disabled={loading} onClick={onConfirm} type="button">
            {loading ? "A processar..." : "Confirmar Pedido"}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
      <span className={styles.message}>{label}</span>
      <strong style={{ textAlign: "right" }}>{value}</strong>
    </div>
  );
}

function urgencyLabel(urgency: Urgency) {
  const labels: Record<Urgency, string> = {
    Alta: "Alta",
    Critica: "Crítica",
    Desastre: "Desastre",
    Media: "Média",
    Normal: "Normal"
  };
  return labels[urgency];
}
