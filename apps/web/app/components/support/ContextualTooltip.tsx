import styles from "./support.module.css";

export function ContextualTooltip({ text, title }: { text: string; title: string }) {
  return (
    <span className={styles.tooltip}>
      <button aria-label={`${title}: ${text}`} className={styles.tipButton} type="button">
        Ajuda: {title}
      </button>
      <small className="muted">{text}</small>
    </span>
  );
}
