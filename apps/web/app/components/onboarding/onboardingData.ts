import type { UserRole } from "@doe-sangue-angola/shared-types";

export type OnboardingStep = {
  eyebrow: string;
  title: string;
  body: string;
  status: "Pronto" | "Pendente" | "A fazer";
};

export const onboardingSteps: Record<UserRole, OnboardingStep[]> = {
  admin: [
    {
      eyebrow: "Bem-vindo",
      title: "Centro Nacional Doe Sangue Angola",
      body: "Veja pedidos, hospitais, dadores, alertas e riscos num só painel.",
      status: "Pronto"
    },
    {
      eyebrow: "Verificação",
      title: "Validar hospitais e clínicas",
      body: "Confirme licença, contacto institucional e província antes de aprovar.",
      status: "A fazer"
    },
    {
      eyebrow: "Monitorização",
      title: "Acompanhar pedidos em tempo real",
      body: "Use o ticker e mapa de escassez para priorizar O-, A+ e pedidos críticos.",
      status: "Pronto"
    },
    {
      eyebrow: "Segurança",
      title: "Rever alertas de fraude",
      body: "Analise duplicados, hospitais suspeitos e pedidos com padrões anormais.",
      status: "Pendente"
    }
  ],
  hospital: [
    {
      eyebrow: "Bem-vindo",
      title: "Operação clínica verificada",
      body: "Complete os dados do hospital para começar a criar pedidos de sangue.",
      status: "Pronto"
    },
    {
      eyebrow: "Perfil",
      title: "Completar perfil do hospital",
      body: "Confirme nome, município, contacto, capacidade e pessoa responsável.",
      status: "A fazer"
    },
    {
      eyebrow: "Licença",
      title: "Carregar licença sanitária",
      body: "Use o espaço reservado para anexar a licença antes da validação nacional.",
      status: "Pendente"
    },
    {
      eyebrow: "Pedidos",
      title: "Criar pedidos de sangue",
      body: "Depois de verificado, crie pedidos urgentes e acompanhe PINs de dadores.",
      status: "Pendente"
    }
  ],
  donor: [
    {
      eyebrow: "Bem-vindo",
      title: "O seu app de dador",
      body: "Configure o perfil para receber pedidos compatíveis perto de si.",
      status: "Pronto"
    },
    {
      eyebrow: "Perfil",
      title: "Adicionar tipo sanguíneo",
      body: "Informe o tipo sanguíneo para melhorar o matching com hospitais.",
      status: "A fazer"
    },
    {
      eyebrow: "Segurança",
      title: "Contacto de emergência",
      body: "Adicione uma pessoa de confiança para situações clínicas importantes.",
      status: "Pendente"
    },
    {
      eyebrow: "Elegibilidade",
      title: "Completar triagem e notificações",
      body: "Responda à elegibilidade e ative notificações para pedidos urgentes.",
      status: "Pendente"
    }
  ],
  support: [
    {
      eyebrow: "Acesso limitado",
      title: "Conta de suporte",
      body: "Esta função é gerida por administradores e não abre portais operacionais.",
      status: "Pronto"
    }
  ],
  viewer: [
    {
      eyebrow: "Acesso limitado",
      title: "Conta de observador",
      body: "Esta função é gerida por administradores e não altera dados operacionais.",
      status: "Pronto"
    }
  ]
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Administração Nacional",
  hospital: "Hospital/Clínica",
  donor: "Dador",
  support: "Suporte",
  viewer: "Observador"
};
