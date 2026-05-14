import styles from "./mobileSafety.module.css";

export function VerificationBadge({ verified = true }: { verified?: boolean }) {
  return (
    <span className={styles.badge}>
      {verified ? "✓ Dador verificado" : "Verificação pendente"}
    </span>
  );
}
