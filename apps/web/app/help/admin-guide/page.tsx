import { HelpArticle } from "../shared";

const steps = [
  "Entre como Admin e confirme que o painel nacional abre sem erros.",
  "Abra Prontidão Piloto e confirme saúde do sistema, exportações e checklist.",
  "Confirme hospitais ativos, dadores ativos, pedidos abertos e ações falhadas.",
  "Monitorize Pedidos de Sangue para ver novos pedidos criados pelo hospital.",
  "Acompanhe Auditoria para confirmar pedido criado, dador aceite, PIN validado e conclusão.",
  "Use Reportar Problema se uma ação falhar, escolhendo gravidade e descrevendo a página.",
  "No fim da sessão, exporte CSVs críticos e registe observações no relatório do piloto."
];

export default function AdminPilotGuidePage() {
  return <HelpArticle title="Guia do Admin Piloto" steps={steps} />;
}
