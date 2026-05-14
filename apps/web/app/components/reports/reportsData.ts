import {
  appointments,
  auditLogs,
  donors,
  hospitals,
  inventory,
  requests
} from "@doe-sangue-angola/shared-services";

export type ReportRole = "admin" | "hospital";

export type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  rows: Record<string, string>[];
  summary: Array<[string, string]>;
};

const hospitalName = (id: string) =>
  hospitals.find((hospital) => hospital.id === id)?.name ?? "Hospital";

const donorName = (id: string) =>
  donors.find((donor) => donor.id === id)?.name ?? "Dador";

const requestRows = requests.map((request) => ({
  Código: request.patientCode,
  Hospital: hospitalName(request.hospitalId),
  Sangue: request.bloodType,
  Unidades: String(request.units),
  Urgência: request.urgency,
  Estado: request.status,
  Data: request.createdAt.slice(0, 10)
}));

export const reportsByRole: Record<ReportRole, ReportDefinition[]> = {
  admin: [
    {
      id: "requests",
      title: "Relatório de pedidos de sangue",
      description: "Pedidos nacionais por estado, urgência e tipo sanguíneo.",
      rows: requestRows,
      summary: [["Pedidos", "142"], ["Urgentes", "27"], ["Taxa resposta", "87%"]]
    },
    {
      id: "hospitals",
      title: "Relatório de atividade hospitalar",
      description: "Hospitais verificados, capacidade e pedidos recentes.",
      rows: hospitals.map((item) => ({
        Hospital: item.name,
        Província: item.province,
        Município: item.municipality,
        Capacidade: String(item.capacity),
        Estado: item.verified ? "Verificado" : "Pendente"
      })),
      summary: [["Hospitais", "156"], ["Verificados", "148"], ["Pendentes", "8"]]
    },
    {
      id: "donors",
      title: "Relatório de atividade dos dadores",
      description: "Disponibilidade, pontos e última doação por província.",
      rows: donors.map((item) => ({
        Dador: item.name,
        Sangue: item.bloodType,
        Província: item.province,
        Disponível: item.available ? "Sim" : "Não",
        Pontos: String(item.points)
      })),
      summary: [["Dadores", "25.680"], ["Online", "2.487"], ["Elegíveis", "18.420"]]
    },
    {
      id: "shortage",
      title: "Relatório de escassez",
      description: "Tipos sanguíneos abaixo do mínimo seguro.",
      rows: inventory.map((item) => ({
        Sangue: item.bloodType,
        Unidades: String(item.units),
        Mínimo: String(item.safeMinimum),
        Estado: item.units < item.safeMinimum ? "Escassez" : "Adequado"
      })),
      summary: [["Críticos", "2"], ["Adequados", "3"], ["Unidades", "75"]]
    },
    {
      id: "fraud",
      title: "Relatório de fraude",
      description: "Sinais suspeitos e revisões pendentes.",
      rows: [
        { Caso: "FR-091", Tipo: "Hospital", Risco: "Alto", Estado: "Revisão" },
        { Caso: "FR-077", Tipo: "Pedido duplicado", Risco: "Médio", Estado: "Aberto" }
      ],
      summary: [["Casos", "12"], ["Alto risco", "3"], ["Resolvidos", "9"]]
    },
    {
      id: "audit",
      title: "Relatório de auditoria",
      description: "Ações recentes de administradores, hospitais e agentes.",
      rows: auditLogs.map((log) => ({
        Hora: log.time,
        Ator: log.actor,
        Ação: log.action
      })),
      summary: [["Eventos", "1.248"], ["Críticos", "4"], ["Hoje", "86"]]
    }
  ],
  hospital: [
    {
      id: "requests",
      title: "Relatório de pedidos",
      description: "Pedidos criados pelo hospital e respetivo estado.",
      rows: requestRows.filter((row) => row.Hospital === "Hospital Geral de Luanda"),
      summary: [["Pedidos", "18"], ["Agendados", "7"], ["Concluídos", "142"]]
    },
    {
      id: "donations",
      title: "Relatório de doações recebidas",
      description: "Dadores recebidos, PINs e conclusão clínica.",
      rows: appointments.map((item) => ({
        Dador: donorName(item.donorId),
        Data: item.date,
        Hora: item.time,
        PIN: item.pin,
        Estado: item.status
      })),
      summary: [["Doações", "368"], ["Este mês", "42"], ["PIN validado", "96%"]]
    },
    {
      id: "inventory",
      title: "Relatório de inventário",
      description: "Stock por tipo sanguíneo, reserva e mínimo seguro.",
      rows: inventory.map((item) => ({
        Sangue: item.bloodType,
        Disponível: String(item.units),
        Reserva: String(Math.max(1, Math.floor(item.units / 3))),
        Mínimo: String(item.safeMinimum)
      })),
      summary: [["Unidades", "75"], ["Em reserva", "24"], ["A expirar", "12"]]
    },
    {
      id: "appointments",
      title: "Relatório de agendamentos",
      description: "Agenda de dadores e estado de confirmação.",
      rows: appointments.map((item) => ({
        Dador: donorName(item.donorId),
        Data: item.date,
        Hora: item.time,
        Hospital: hospitalName(item.hospitalId),
        Estado: item.status
      })),
      summary: [["Hoje", "5"], ["Confirmados", "4"], ["Pendentes", "1"]]
    }
  ]
};
