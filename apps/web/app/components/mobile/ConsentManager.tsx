"use client";

import { useState } from "react";
import styles from "./mobileSafety.module.css";

const consentItems = [
  "Aceito ser contactado por hospitais verificados.",
  "Confirmo que devo seguir orientação médica antes de doar.",
  "Autorizo o uso dos meus dados para compatibilidade sanguínea."
];

export function ConsentManager() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <section className={styles.section}>
      <strong>Consentimentos</strong>
      <div className={styles.notice}>
        <strong>Aviso médico</strong>
        <span>Este app coordena doações. A decisão final é sempre da equipa clínica.</span>
      </div>
      <p className={styles.finePrint}>
        Usamos dados de perfil, tipo sanguíneo, localização aproximada e notificações para
        compatibilidade, contacto e segurança operacional.
      </p>
      {consentItems.map((item) => (
        <label className={styles.row} key={item}>
          <span>{item}</span>
          <input
            className={styles.checkbox}
            checked={Boolean(checked[item])}
            onChange={(event) => setChecked({ ...checked, [item]: event.target.checked })}
            type="checkbox"
          />
        </label>
      ))}
    </section>
  );
}
