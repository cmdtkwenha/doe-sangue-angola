import { HelpArticle } from "../shared";

export default function DonateHelpPage() {
  return (
    <HelpArticle
      title="Como doar sangue"
      steps={[
        "Entre na aplicação como dador.",
        "Complete o perfil com tipo sanguíneo, província e município.",
        "Abra Pedidos Disponíveis e confirme hospital, localização e urgência.",
        "Aceite o pedido apenas se estiver disponível e elegível.",
        "Apresente o PIN no hospital para validar a doação."
      ]}
    />
  );
}
