"use client";

import { useState } from "react";
import styles from "./mobileSafety.module.css";

const options = [
  ["partilharLocalizacao", "Usar localização aproximada para pedidos próximos"],
  ["mostrarPerfil", "Mostrar perfil apenas a hospitais verificados"],
  ["relatorios", "Permitir estatísticas anónimas para melhorar o serviço"]
] as const;

export function PrivacySettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    partilharLocalizacao: true,
    mostrarPerfil: true,
    relatorios: true
  });

  return (
    <section className={styles.section}>
      <strong>Privacidade dos Dados</strong>
      <p className={styles.finePrint}>
        Os seus dados são usados para encontrar pedidos compatíveis e gerir agendamentos.
      </p>
      {options.map(([key, label]) => (
        <label className={styles.row} key={key}>
          <span>{label}</span>
          <input
            className={styles.toggle}
            checked={settings[key]}
            onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}
            type="checkbox"
          />
        </label>
      ))}
      <div className={styles.notice}>
        <strong>Eliminar conta</strong>
        <span>
          Para pedir eliminação, contacte suporte com o email da conta. A equipa confirmará identidade
          antes de apagar ou anonimizar dados do piloto.
        </span>
      </div>
    </section>
  );
}
