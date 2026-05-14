export type Locale = "pt" | "en" | "fr";

export type BloodType =
  | "O-"
  | "O+"
  | "A-"
  | "A+"
  | "B-"
  | "B+"
  | "AB-"
  | "AB+";

export type UserRole = "admin" | "hospital" | "donor";

export type Urgency = "Critica" | "Alta" | "Media" | "Normal";

export type RequestStatus =
  | "Aberto"
  | "Em Correspondência"
  | "Agendado"
  | "Doador a Caminho"
  | "PIN Validado"
  | "Concluído"
  | "Cancelado"
  | "Triagem"
  | "Concluido";

export type Donor = {
  id: string;
  name: string;
  bloodType: BloodType;
  province: string;
  municipality: string;
  available: boolean;
  lastDonation: string;
  points: number;
  preferredHospitalId?: string;
};

export type Hospital = {
  id: string;
  name: string;
  province: string;
  municipality: string;
  verified: boolean;
  capacity: number;
  contact: string;
};

export type BloodRequest = {
  id: string;
  hospitalId: string;
  patientCode: string;
  bloodType: BloodType;
  units: number;
  urgency: Urgency;
  status: RequestStatus;
  createdAt: string;
};

export type Appointment = {
  id: string;
  donorId: string;
  hospitalId: string;
  date: string;
  time: string;
  pin: string;
  status: "Confirmado" | "Pendente" | "Concluido";
};

export type InventoryItem = {
  bloodType: BloodType;
  units: number;
  safeMinimum: number;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  time: string;
};

export type Communication = {
  id: string;
  channel: "SMS" | "Push" | "Chamada";
  recipient: string;
  message: string;
  status: "Enviado" | "Pendente";
};

export type Metric = {
  label: string;
  value: string;
  change: string;
  tone: "red" | "gold" | "black" | "green";
};

export type MatchResult = {
  donor: Donor;
  score: number;
  recommendation: "Notificar" | "Reserva" | "Aguardar";
  reasons: string[];
};
