import styles from "./support.module.css";

export type CompletionItem = {
  done: boolean;
  label: string;
};

export function OnboardingCompletionTracker({
  items,
  title
}: {
  items: CompletionItem[];
  title: string;
}) {
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / Math.max(items.length, 1)) * 100);

  return (
    <section className={styles.tracker}>
      <div className="eyebrow">Onboarding</div>
      <h2>{title}</h2>
      <div className={styles.progress} aria-label={`Progresso ${percent}%`}>
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.items}>
        {items.map((item) => (
          <span className={item.done ? "pill green" : "pill gold"} key={item.label}>
            {item.done ? "OK" : "Pendente"} · {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
