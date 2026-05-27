"use client";

import styles from "./confirmation.module.css";

export function ActionToast({
  message,
  tone = "success"
}: {
  message: string;
  tone?: "error" | "success";
}) {
  if (!message) return null;
  return (
    <div className={`${styles.toast} ${tone === "error" ? styles.toastError : ""}`} role="status">
      {message}
    </div>
  );
}
