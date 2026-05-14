import styles from "./management.module.css";

export function StatusBadge({ status }: { status: string }) {
  const tone = status.includes("Verificado") || status.includes("Enviado")
    || status.includes("Concluído") || status.includes("Aprovado")
    ? styles.green
    : status.includes("Pendente") || status.includes("Aberto")
      ? styles.gold
      : status.includes("Rejeitado") || status.includes("Suspenso")
        || status.includes("Crítico") || status.includes("Revisão")
        ? styles.red
        : styles.dark;

  return <span className={`${styles.badge} ${tone}`}>{status}</span>;
}
