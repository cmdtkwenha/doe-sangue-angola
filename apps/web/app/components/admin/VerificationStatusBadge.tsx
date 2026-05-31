const toneByStatus: Record<string, string> = {
  Suspenso: "pill red",
  Verificado: "pill green",
  Pendente: "pill gold",
  Rejeitado: "pill red",
  "Revisão Necessária": "pill red"
};

export function VerificationStatusBadge({ status }: { status: string }) {
  return <span className={toneByStatus[status] ?? "pill gold"}>{status}</span>;
}
