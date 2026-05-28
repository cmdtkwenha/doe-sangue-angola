import { HelpArticle } from "../shared";

const steps = [
  "Entre com a conta hospital e confirme que está ligada ao hospital aprovado.",
  "Abra Solicitar Sangue e crie um pedido urgente apenas com dados de teste autorizados.",
  "Confirme que o pedido aparece em Pedidos de Sangue Ativos.",
  "Quando um dador aceitar, abra Dadores Recebidos ou Lista ETA.",
  "Marque Chegou apenas quando o dador estiver no local.",
  "Peça o PIN ao dador e valide exatamente o código mostrado na app.",
  "Conclua a doação só depois da validação e registe qualquer falha em Reportar Problema."
];

export default function HospitalPilotGuidePage() {
  return <HelpArticle title="Guia do Hospital Piloto" steps={steps} />;
}
