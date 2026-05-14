"use client";

import type { FormEvent, ReactNode } from "react";
import styles from "./accessibility.module.css";

export function AccessibleForm({
  children,
  className,
  error,
  label,
  onSubmit
}: {
  children: ReactNode;
  className?: string;
  error?: string | null;
  label: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      aria-describedby={error ? "form-error" : undefined}
      aria-label={label}
      className={`${styles.form} ${className ?? ""}`}
      noValidate={false}
      onSubmit={onSubmit}
    >
      {children}
      {error ? (
        <p className={styles.error} id="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function FieldHint({ children, id }: { children: ReactNode; id: string }) {
  return (
    <span className={styles.helper} id={id}>
      {children}
    </span>
  );
}
