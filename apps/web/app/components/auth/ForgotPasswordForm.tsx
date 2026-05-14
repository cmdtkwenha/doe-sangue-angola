"use client";

import Link from "next/link";
import { useState } from "react";
import { AccessibleForm } from "../accessibility";
import styles from "./auth.module.css";
import { useAuth } from "./useAuth";

export function ForgotPasswordForm() {
  const { error, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AccessibleForm
      className={styles.formStack}
      error={error}
      label="Recuperar palavra-passe"
      onSubmit={(event) => {
        event.preventDefault();
        void resetPassword(email).then(() => setSent(true));
      }}
    >
      <label className="eyebrow" htmlFor="email">Email</label>
      <input className={styles.input} id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      {sent ? (
        <p className={styles.success} role="status">
          Se o email existir, enviámos instruções de recuperação.
        </p>
      ) : null}
      <button className="button" type="submit">Enviar recuperação</button>
      <Link className={styles.backLink} href="/auth">Voltar ao login</Link>
    </AccessibleForm>
  );
}
