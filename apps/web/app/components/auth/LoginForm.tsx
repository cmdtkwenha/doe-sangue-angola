"use client";

import { demoAccounts, demoPasswords } from "@doe-sangue-angola/shared-services";
import Link from "next/link";
import { useState } from "react";
import { AccessibleForm, FieldHint } from "../accessibility";
import styles from "./auth.module.css";
import { useAuth } from "./useAuth";

export function LoginForm() {
  const { error, login, loading } = useAuth();
  const [email, setEmail] = useState("admin@sangueangola.ao");
  const [password, setPassword] = useState("demo@2026");
  const loginAs = (account: typeof demoAccounts[number]) => {
    setEmail(account.email);
    setPassword(demoPasswords[1]);
    void login(account.email, demoPasswords[1]);
  };

  return (
    <AccessibleForm
      error={error}
      label="Entrar na plataforma Doe Sangue Angola"
      className={styles.formStack}
      onSubmit={(event) => {
        event.preventDefault();
        void login(email, password);
      }}
    >
      <label className="eyebrow" htmlFor="email">Email</label>
      <input
        className={styles.input}
        id="email"
        aria-describedby="email-hint"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="utilizador@sangueangola.ao"
        required
        type="email"
        value={email}
      />
      <FieldHint id="email-hint">Use o email associado ao seu perfil.</FieldHint>
      <label className="eyebrow" htmlFor="password">Palavra-passe</label>
      <input
        className={styles.input}
        id="password"
        aria-describedby="password-hint"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="A sua palavra-passe"
        required
        type="password"
        value={password}
      />
      <FieldHint id="password-hint">A palavra-passe tem validação segura.</FieldHint>
      <section className={styles.demoBox} aria-label="Credenciais demo">
        <strong>Entrar sem configurar Supabase</strong>
        <p>Credenciais: email abaixo com <b>{demoPasswords[0]}</b>. Também aceita <b>{demoPasswords[1]}</b>.</p>
        {demoAccounts.map((account) => (
          <button
            className={styles.demoAccount}
            key={account.email}
            onClick={() => loginAs(account)}
            type="button"
          >
            <span>Entrar como {account.label}</span>
            <small>{account.email} → {account.route}</small>
          </button>
        ))}
      </section>
      <button className="button" disabled={loading} type="submit">
        {loading ? "A validar sessão..." : "Entrar"}
      </button>
      <div className={styles.links}>
        <Link href="/auth/register">Criar conta</Link>
        <Link href="/auth/forgot-password">Recuperar palavra-passe</Link>
      </div>
    </AccessibleForm>
  );
}
