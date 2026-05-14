"use client";

import { useState } from "react";
import styles from "./mobileSafety.module.css";

const initialContacts = [
  { name: "Manuel Santos", phone: "+244 923 456 789", relation: "Pai" }
];

export function EmergencyContactsPanel() {
  const [contacts, setContacts] = useState(initialContacts);

  return (
    <section className={styles.section}>
      <strong>Contactos de Emergência</strong>
      {contacts.map((contact) => (
        <article className={styles.card} key={contact.phone}>
          <strong>{contact.name}</strong>
          <span className="muted">{contact.relation} · {contact.phone}</span>
        </article>
      ))}
      <button
        className={`${styles.button} ${styles.softButton}`}
        onClick={() => setContacts([...contacts, {
          name: "Ana Costa",
          phone: "+244 923 000 118",
          relation: "Irmã"
        }])}
        type="button"
      >
        Adicionar contacto
      </button>
    </section>
  );
}
