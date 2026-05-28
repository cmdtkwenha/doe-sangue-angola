"use client";

import type { UserRole } from "@doe-sangue-angola/shared-types";
import { analyticsEvents } from "@doe-sangue-angola/shared-services";
import Link from "next/link";
import { useState } from "react";
import { AccessibleForm, FieldHint } from "../accessibility";
import styles from "./auth.module.css";
import { RoleSelector } from "./RoleSelector";
import { useAuth } from "./useAuth";

export function RegisterForm() {
  const { error, loading, register } = useAuth();
  const [role, setRole] = useState<UserRole>("donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AccessibleForm
      className={styles.formStack}
      error={error}
      label="Criar conta Doe Sangue Angola"
      onSubmit={(event) => {
        event.preventDefault();
        analyticsEvents.signup(role);
        void register({ email, name, password, role });
      }}
    >
      <RoleSelector role={role} setRole={setRole} />
      <label className="eyebrow" htmlFor="name">Nome</label>
      <input
        aria-describedby="name-hint"
        className={styles.input}
        id="name"
        onChange={(event) => setName(event.target.value)}
        required
        value={name}
      />
      <FieldHint id="name-hint">Informe o nome oficial do perfil.</FieldHint>
      <label className="eyebrow" htmlFor="email">Email</label>
      <input
        className={styles.input}
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
      />
      <label className="eyebrow" htmlFor="password">Palavra-passe</label>
      <input
        aria-describedby="new-password-hint"
        className={styles.input}
        id="password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      <FieldHint id="new-password-hint">Use pelo menos 8 caracteres.</FieldHint>
      <button className="button" disabled={loading} type="submit">
        {loading ? "A criar conta..." : "Criar conta"}
      </button>
      <Link className={styles.backLink} href="/auth">Já tenho conta</Link>
    </AccessibleForm>
  );
}
