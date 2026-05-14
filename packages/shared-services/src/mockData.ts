import type {
  Alert,
  Appointment,
  AuditLog,
  BloodRequest,
  Communication,
  Donor,
  Hospital,
  InventoryItem,
  Metric
} from "@doe-sangue-angola/shared-types";

// TODO(production): replace this file with Supabase seed data and read-only fixtures for tests.
export const hospitals: Hospital[] = [
  {
    id: "h1",
    name: "Hospital Geral de Luanda",
    province: "Luanda",
    municipality: "Kilamba Kiaxi",
    verified: true,
    capacity: 84,
    contact: "+244 923 000 118"
  },
  {
    id: "h2",
    name: "Clinica Sagrada Esperanca",
    province: "Luanda",
    municipality: "Ingombota",
    verified: true,
    capacity: 42,
    contact: "+244 923 000 219"
  },
  {
    id: "h3",
    name: "Hospital Central do Huambo",
    province: "Huambo",
    municipality: "Huambo",
    verified: true,
    capacity: 56,
    contact: "+244 923 000 331"
  }
];

export const donors: Donor[] = [
  {
    id: "d1",
    name: "Maria Joao Santos",
    bloodType: "O-",
    province: "Luanda",
    municipality: "Talatona",
    available: true,
    lastDonation: "2026-01-18",
    points: 1280,
    preferredHospitalId: "h1"
  },
  {
    id: "d2",
    name: "Adao Domingos",
    bloodType: "A+",
    province: "Luanda",
    municipality: "Viana",
    available: true,
    lastDonation: "2025-12-09",
    points: 920,
    preferredHospitalId: "h2"
  },
  {
    id: "d3",
    name: "Celina Mateus",
    bloodType: "B+",
    province: "Huambo",
    municipality: "Caala",
    available: false,
    lastDonation: "2026-03-22",
    points: 740,
    preferredHospitalId: "h3"
  },
  {
    id: "d4",
    name: "Lourenco Miguel",
    bloodType: "O+",
    province: "Luanda",
    municipality: "Cazenga",
    available: true,
    lastDonation: "2025-11-14",
    points: 1510,
    preferredHospitalId: "h1"
  }
];

export const requests: BloodRequest[] = [
  {
    id: "r1",
    hospitalId: "h1",
    patientCode: "PAC-4821",
    bloodType: "O-",
    units: 4,
    urgency: "Critica",
    status: "Aberto",
    createdAt: "2026-05-11T08:30:00Z"
  },
  {
    id: "r2",
    hospitalId: "h2",
    patientCode: "PAC-1188",
    bloodType: "A+",
    units: 2,
    urgency: "Alta",
    status: "Em Correspondência",
    createdAt: "2026-05-11T09:10:00Z"
  },
  {
    id: "r3",
    hospitalId: "h3",
    patientCode: "PAC-9044",
    bloodType: "B+",
    units: 3,
    urgency: "Media",
    status: "Agendado",
    createdAt: "2026-05-10T16:45:00Z"
  }
];

export const appointments: Appointment[] = [
  {
    id: "a1",
    donorId: "d1",
    hospitalId: "h1",
    date: "2026-05-12",
    time: "09:30",
    pin: "4821",
    status: "Confirmado"
  },
  {
    id: "a2",
    donorId: "d2",
    hospitalId: "h2",
    date: "2026-05-12",
    time: "11:00",
    pin: "1188",
    status: "Pendente"
  }
];

export const inventory: InventoryItem[] = [
  { bloodType: "O-", units: 8, safeMinimum: 14 },
  { bloodType: "O+", units: 31, safeMinimum: 22 },
  { bloodType: "A+", units: 18, safeMinimum: 20 },
  { bloodType: "B+", units: 11, safeMinimum: 16 },
  { bloodType: "AB+", units: 7, safeMinimum: 8 }
];

export const nationalMetrics: Metric[] = [
  { label: "Pedidos ativos", value: "126", change: "+18 hoje", tone: "red" },
  { label: "Dadores disponiveis", value: "8.421", change: "+312 semana", tone: "black" },
  { label: "Hospitais ligados", value: "47", change: "12 provincias", tone: "gold" },
  { label: "Tempo medio", value: "38 min", change: "-9 min", tone: "green" }
];

export const alerts: Alert[] = [
  {
    id: "al1",
    title: "Stock O- abaixo do minimo",
    message: "Luanda precisa de 6 unidades para voltar ao nivel seguro.",
    severity: "critical"
  },
  {
    id: "al2",
    title: "Validacao pendente",
    message: "3 clinicas aguardam revisao documental.",
    severity: "warning"
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: "log1",
    actor: "Admin Nacional",
    action: "Validou Hospital Central do Huambo",
    time: "10:18"
  },
  {
    id: "log2",
    actor: "Hospital Geral de Luanda",
    action: "Criou pedido critico O-",
    time: "09:42"
  },
  {
    id: "log3",
    actor: "Agente matchingAgent",
    action: "Recomendou 3 dadores",
    time: "09:44"
  }
];

export const communications: Communication[] = [
  {
    id: "com1",
    channel: "Push",
    recipient: "Maria Joao Santos",
    message: "Pedido urgente O- no Hospital Geral de Luanda.",
    status: "Enviado"
  },
  {
    id: "com2",
    channel: "SMS",
    recipient: "Adao Domingos",
    message: "Confirme a sua disponibilidade para doacao.",
    status: "Pendente"
  }
];
