export type ReportRole = "admin" | "hospital";

export type ReportDefinition = {
  description: string;
  id: string;
  rows: Record<string, string>[];
  summary: Array<[string, string]>;
  title: string;
};

const emptySummary: Array<[string, string]> = [
  ["Registos", "0"],
  ["Fonte", "Supabase"],
  ["Estado", "A aguardar dados"]
];

const emptyRows: Record<string, string>[] = [];

export const reportsByRole: Record<ReportRole, ReportDefinition[]> = {
  admin: [
    report("requests", "Relatório de pedidos de sangue", "Pedidos nacionais reais por estado e tipo."),
    report("hospitals", "Relatório de atividade hospitalar", "Hospitais reais, capacidade e pedidos recentes."),
    report("donors", "Relatório de atividade dos dadores", "Dadores reais, disponibilidade e elegibilidade."),
    report("shortage", "Relatório de escassez", "Escassez real a partir do inventário hospitalar."),
    report("fraud", "Relatório de fraude", "Revisões reais registadas pelo sistema."),
    report("audit", "Relatório de auditoria", "Ações reais de administradores, hospitais e dadores.")
  ],
  hospital: [
    report("requests", "Relatório de pedidos", "Pedidos reais criados pelo hospital."),
    report("donations", "Relatório de doações recebidas", "Dadores recebidos e validação clínica."),
    report("inventory", "Relatório de inventário", "Stock real por tipo sanguíneo."),
    report("appointments", "Relatório de agendamentos", "Agenda real de dadores e confirmações.")
  ]
};

function report(id: string, title: string, description: string): ReportDefinition {
  return {
    description,
    id,
    rows: emptyRows,
    summary: emptySummary,
    title
  };
}
