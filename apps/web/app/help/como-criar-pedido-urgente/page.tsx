import { HelpArticle } from "../shared";

export default function UrgentHelpPage() {
  return (
    <HelpArticle
      title="Como criar pedido urgente"
      steps={[
        "Entre como hospital ou clínica verificada.",
        "Confirme que a conta está ligada ao hospital aprovado.",
        "Clique em Criar Pedido Urgente ou abra Solicitar Sangue.",
        "Confirme tipo sanguíneo, unidades, urgência e município.",
        "Acompanhe aceite do dador e validação do PIN no painel."
      ]}
    />
  );
}
