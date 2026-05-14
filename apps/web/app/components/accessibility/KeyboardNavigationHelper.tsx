"use client";

import { useEffect } from "react";
import styles from "./accessibility.module.css";

export function KeyboardNavigationHelper() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") document.body.dataset.keyboard = "true";
    };
    const onPointer = () => {
      document.body.dataset.keyboard = "false";
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <a className={styles.skipLink} href="#conteudo-principal">
      Saltar para o conteúdo principal
    </a>
  );
}
