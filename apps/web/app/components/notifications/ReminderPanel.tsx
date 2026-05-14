import styles from "./notifications.module.css";
import { ReminderCard } from "./ReminderCard";

type Reminder = {
  action: string;
  body: string;
  donorId: string;
  title: string;
};

export function ReminderPanel({ reminders }: { reminders: Reminder[] }) {
  return (
    <section className={styles.reminderPanel}>
      <div className={styles.engine}>
        <strong>Motor de lembretes inteligente</strong>
        <span>reminderAgent acompanha elegibilidade e agendamentos.</span>
      </div>
      {reminders.map((reminder) => (
        <ReminderCard
          action={reminder.action}
          body={reminder.body}
          title={reminder.title}
          key={`${reminder.donorId}-${reminder.body}`}
        />
      ))}
    </section>
  );
}
