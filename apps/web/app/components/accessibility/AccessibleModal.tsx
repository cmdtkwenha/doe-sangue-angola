"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./accessibility.module.css";

const selector = "a,button,input,select,textarea,[tabindex]:not([tabindex='-1'])";

export function AccessibleModal({
  children,
  onClose,
  size = "normal",
  title
}: {
  children: ReactNode;
  onClose?: () => void;
  size?: "detail" | "normal";
  title: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const focusables = ref.current?.querySelectorAll<HTMLElement>(selector);
    focusables?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.modalShade}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        aria-label={title}
        aria-modal="true"
        className={`${styles.modalCard} ${size === "detail" ? styles.detailModal : ""}`}
        ref={ref}
        role="dialog"
      >
        {children}
      </section>
    </div>,
    document.body
  );
}
