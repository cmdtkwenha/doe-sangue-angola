import { listAuditLogs } from "@doe-sangue-angola/shared-services";

export type ComplianceEventType =
  | "Pedido criado"
  | "Dador aceitou"
  | "PIN validado"
  | "Hospital verificado"
  | "Login"
  | "Permissão alterada"
  | "Broadcast enviado";

export type ComplianceEvent = {
  id: string;
  type: ComplianceEventType;
  actor: string;
  hospital: string;
  province: string;
  date: string;
  time: string;
  action: string;
  risk: "Baixo" | "Médio" | "Alto";
};

const requiredEvents: ComplianceEvent[] = [
  {
    id: "cmp-req",
    type: "Pedido criado",
    actor: "Dr. João Mendes",
    hospital: "Hospital Geral de Luanda",
    province: "Luanda",
    date: "2026-05-13",
    time: "09:42",
    action: "Criou pedido urgente O- com 4 bolsas",
    risk: "Médio"
  },
  {
    id: "cmp-accept",
    type: "Dador aceitou",
    actor: "Maria João Santos",
    hospital: "Hospital Geral de Luanda",
    province: "Luanda",
    date: "2026-05-13",
    time: "09:47",
    action: "Aceitou pedido e recebeu agendamento",
    risk: "Baixo"
  },
  {
    id: "cmp-pin",
    type: "PIN validado",
    actor: "Enf. Ana Isabel",
    hospital: "Hospital Geral de Luanda",
    province: "Luanda",
    date: "2026-05-13",
    time: "10:12",
    action: "Validou PIN de 4 dígitos no ponto clínico",
    risk: "Baixo"
  },
  {
    id: "cmp-hospital",
    type: "Hospital verificado",
    actor: "Admin Nacional",
    hospital: "Hospital Central do Huambo",
    province: "Huambo",
    date: "2026-05-12",
    time: "16:20",
    action: "Aprovou licença e documentos hospitalares",
    risk: "Baixo"
  },
  {
    id: "cmp-login",
    type: "Login",
    actor: "Admin Nacional",
    hospital: "Sistema Nacional",
    province: "Luanda",
    date: "2026-05-13",
    time: "08:58",
    action: "Entrou no portal administrativo",
    risk: "Baixo"
  },
  {
    id: "cmp-permission",
    type: "Permissão alterada",
    actor: "Admin Nacional",
    hospital: "Clínica Sagrada Esperança",
    province: "Luanda",
    date: "2026-05-11",
    time: "15:31",
    action: "Atualizou acesso de equipa clínica",
    risk: "Alto"
  },
  {
    id: "cmp-broadcast",
    type: "Broadcast enviado",
    actor: "Admin Nacional",
    hospital: "Sistema Nacional",
    province: "Benguela",
    date: "2026-05-10",
    time: "11:04",
    action: "Enviou alerta regional de escassez A+",
    risk: "Médio"
  }
];

export const listComplianceEvents = (): ComplianceEvent[] => [
  ...requiredEvents,
  ...listAuditLogs().map((log, index) => ({
    id: `cmp-log-${log.id}`,
    type: "Pedido criado" as ComplianceEventType,
    actor: log.actor,
    hospital: index % 2 === 0 ? "Hospital Geral de Luanda" : "Sistema Nacional",
    province: index % 2 === 0 ? "Luanda" : "Huambo",
    date: "2026-05-13",
    time: log.time,
    action: log.action,
    risk: "Baixo" as const
  }))
];
