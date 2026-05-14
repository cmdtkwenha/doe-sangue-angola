"use client";

import { generateInvestorDemoScenario } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./demo.module.css";

export function DemoScenarioGenerator() {
  const [message, setMessage] = useState("Pronto para gerar pedido O- ao vivo.");

  return (
    <section className={styles.generator}>
      <div>
        <div className="eyebrow">Cenário ao vivo</div>
        <h3>Gerar pedido urgente</h3>
        <p>{message}</p>
      </div>
      <button
        className={styles.toggleOn}
        onClick={() => setMessage(generateInvestorDemoScenario().message)}
        type="button"
      >
        Criar pedido O-
      </button>
    </section>
  );
}
