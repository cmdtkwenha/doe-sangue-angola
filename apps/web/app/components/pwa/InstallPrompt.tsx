"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./pwa.module.css";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const pathname = usePathname();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [manual, setManual] = useState(false);
  const [hidden, setHidden] = useState(false);
  const eligible = pathname.startsWith("/mobile") || pathname.startsWith("/hospital") || pathname.startsWith("/auth");

  useEffect(() => {
    const handler = (next: Event) => {
      next.preventDefault();
      setEvent(next as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    setManual(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const nav = navigator as Navigator & { standalone?: boolean };
    setHidden(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!eligible || hidden || (!event && !manual)) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") setHidden(true);
    setEvent(null);
  }

  return (
    <aside className={styles.prompt} role="status">
      <span>
        <strong>Instalar App</strong>
        <small>{manual ? "No iPhone, toque Partilhar e escolha Adicionar ao ecrã inicial." : "Aceda mais rápido ao Doe Sangue Angola."}</small>
      </span>
      {event ? <button onClick={() => void install()} type="button">Adicionar ao ecrã inicial</button> : null}
      <button aria-label="Fechar convite de instalação" className={styles.close} onClick={() => setHidden(true)} type="button">×</button>
    </aside>
  );
}
