"use client";

import { AccessibleModal } from "../accessibility";
import styles from "./confirmation.module.css";

export type ConfirmTone = "danger" | "primary";

export function ConfirmationModal({
  confirmLabel = "Confirmar",
  loading,
  message,
  onClose,
  onConfirm,
  open,
  reason,
  reasonOptions = [],
  setReason,
  title,
  tone = "primary"
}: {
  confirmLabel?: string;
  loading?: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  reason?: string;
  reasonOptions?: string[];
  setReason?: (value: string) => void;
  title: string;
  tone?: ConfirmTone;
}) {
  if (!open) return null;

  return (
    <AccessibleModal onClose={loading ? undefined : onClose} title={title}>
      <div className={styles.body}>
        <div className={styles.header}>
          <span>
            <h3>{title}</h3>
            <p className={styles.message}>{message}</p>
          </span>
          <button
            aria-label="Fechar confirmação"
            className={styles.close}
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {reasonOptions.length > 0 && setReason ? (
          <label className={styles.field}>
            Motivo opcional
            <select
              disabled={loading}
              onChange={(event) => setReason(event.target.value)}
              value={reason ?? ""}
            >
              <option value="">Selecionar motivo</option>
              {reasonOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        ) : null}
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.secondary}`}
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            Voltar
          </button>
          <button
            className={`${styles.button} ${styles[tone]}`}
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? "A processar..." : confirmLabel}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
