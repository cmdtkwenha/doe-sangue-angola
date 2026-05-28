import { HelpArticle } from "../shared";

const steps = [
  "Entre com a conta de dador e complete o onboarding se for pedido.",
  "Confirme tipo sanguíneo, província e município antes de procurar pedidos.",
  "Abra Pedidos Disponíveis e leia hospital, localização, urgência e bolsas necessárias.",
  "Aceite apenas pedidos que consegue cumprir durante a sessão piloto.",
  "Depois de aceitar, guarde o PIN mostrado em Meu PIN de Doação.",
  "Mostre o PIN ao hospital quando chegar ao local.",
  "Depois da doação, confirme o estado concluído e deixe feedback sobre a experiência."
];

export default function DonorPilotGuidePage() {
  return <HelpArticle title="Guia do Dador Piloto" steps={steps} />;
}
