"use client";

import { OnboardingCompletionTracker } from "../support";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalSetupTracker() {
  const { data: hospital } = useCurrentHospital();

  return (
    <OnboardingCompletionTracker
      title="Configuração do hospital"
      items={[
        { done: Boolean(hospital?.id), label: "Conta ligada ao hospital" },
        { done: Boolean(hospital?.name), label: "Nome verificado" },
        { done: Boolean(hospital?.province), label: "Província definida" },
        { done: Boolean(hospital?.municipality), label: "Município definido" }
      ]}
    />
  );
}
