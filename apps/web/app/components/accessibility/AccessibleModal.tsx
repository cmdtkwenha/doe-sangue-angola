"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./accessibility.module.css";

const selector = "a,button,input,select,textarea,[tabindex]:not([tabindex='-1'])";

export function AccessibleModal({
  children,
  onClose,
  title
}: {
  children: ReactNode;
  onClose?: () => void;
  title: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const focusables = ref.current?.querySelectorAll<HTMLElement>(selector);
    focusables?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.modalShade}>
      <section
        aria-label={title}
        aria-modal="true"
        className={styles.modalCard}
        ref={ref}
        role="dialog"
      >
        {children}
      </section>
    </div>
  );
}
