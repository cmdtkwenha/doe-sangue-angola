import type { UserRole } from "@doe-sangue-angola/shared-types";

export type SettingRow = {
  description: string;
  label: string;
  tone?: "danger";
  type: "button" | "toggle" | "value";
  value: string;
};

export type SettingSection = {
  eyebrow: string;
  rows: SettingRow[];
  title: string;
};

export const settingsData: Record<UserRole, SettingSection[]> = {
  admin: [
    {
      eyebrow: "Plataforma",
      title: "Definições gerais",
      rows: [
        { label: "Modo de dados", description: "Dados operacionais ligados ao backend.", type: "value", value: "Produção" },
        { label: "Idioma padrão", description: "Português primeiro, com EN/FR preparados.", type: "value", value: "Português" },
        { label: "Alertas nacionais", description: "Enviar notificações para pedidos críticos.", type: "toggle", value: "on" }
      ]
    },
    {
      eyebrow: "Segurança",
      title: "Controlo administrativo",
      rows: [
        { label: "Autenticação", description: "Sessões persistentes por função.", type: "value", value: "Ativa" },
        { label: "Gestão de utilizadores", description: "Criar, suspender e rever perfis.", type: "button", value: "Abrir gestão" },
        { label: "Auditoria obrigatória", description: "Registar ações sensíveis.", type: "toggle", value: "on" }
      ]
    }
  ],
  hospital: [
    {
      eyebrow: "Perfil",
      title: "Hospital/Clínica",
      rows: [
        { label: "Nome", description: "Hospital Geral de Luanda.", type: "value", value: "Verificado" },
        { label: "Equipa", description: "Gerir administradores clínicos.", type: "button", value: "Ver membros" },
        { label: "Documentos", description: "Licença e certificações.", type: "button", value: "Carregar documento" }
      ]
    },
    {
      eyebrow: "Operação",
      title: "Preferências clínicas",
      rows: [
        { label: "Notificações de dadores", description: "Avisos de chegada e PIN.", type: "toggle", value: "on" },
        { label: "Inventário mínimo", description: "Alertas para baixo stock.", type: "value", value: "12 unidades" },
        { label: "Escassez regional", description: "Receber alertas de Luanda.", type: "toggle", value: "on" }
      ]
    }
  ],
  donor: [
    {
      eyebrow: "Perfil",
      title: "Dados do dador",
      rows: [
        { label: "Tipo sanguíneo", description: "Usado para matching.", type: "value", value: "O+" },
        { label: "Contacto de emergência", description: "Manuel Santos.", type: "button", value: "Editar" },
        { label: "Idioma", description: "Preferência de comunicação.", type: "value", value: "Português" }
      ]
    },
    {
      eyebrow: "Privacidade",
      title: "Conta e notificações",
      rows: [
        { label: "Pedidos urgentes", description: "Receber pedidos perto de si.", type: "toggle", value: "on" },
        { label: "Lembretes de elegibilidade", description: "Avisar quando puder doar.", type: "toggle", value: "on" },
        { label: "Eliminar conta", description: "Pedido formal com confirmação manual.", tone: "danger", type: "button", value: "Solicitar" }
      ]
    }
  ]
};

export const settingsTitles: Record<UserRole, [string, string]> = {
  admin: ["Definições da plataforma", "Controle idioma, segurança, notificações e utilizadores."],
  hospital: ["Definições do hospital", "Mantenha perfil clínico, equipa, inventário e documentos atualizados."],
  donor: ["Definições do dador", "Gerencie privacidade, notificações, contacto e preferências pessoais."]
};
