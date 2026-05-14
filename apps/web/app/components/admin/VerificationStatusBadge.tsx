import type { VerificationStatus } from "@doe-sangue-angola/shared-services";

const toneByStatus: Record<VerificationStatus, string> = {
  Verificado: "pill green",
  Pendente: "pill gold",
  Rejeitado: "pill red",
  "Revisão Necessária": "pill red"
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return <span className={toneByStatus[status]}>{status}</span>;
}
