export const hospitalNavigation = [
  { label: "Painel Principal", href: "/hospital", icon: "■" },
  { label: "Pedidos de Sangue", href: "/hospital/requests", icon: "□" },
  { label: "Solicitar Sangue", href: "/hospital/new-request", icon: "+" },
  { label: "Dadores Recebidos", href: "/hospital/donors", icon: "□" },
  { label: "Agendamentos", href: "/hospital/schedule", icon: "□" },
  { label: "Inventário de Sangue", href: "/hospital/inventory", icon: "□" },
  { label: "Desempenho", href: "/hospital/performance", icon: "□" },
  { label: "Relatórios", href: "/hospital/reports", icon: "□" },
  { label: "Definições", href: "/hospital/settings", icon: "□" }
] as const;
