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

export type UserRole = "admin" | "hospital" | "donor" | "support" | "viewer";

export type Urgency = "Desastre" | "Critica" | "Alta" | "Media" | "Normal";

export type RequestStatus =
  | "Aberto"
  | "Em Correspondência"
  | "Agendado"
  | "Doador a Caminho"
  | "Pedido preenchido"
  | "Preenchido"
  | "PIN Validado"
  | "Concluído"
  | "Cancelado"
  | "Triagem"
  | "Concluido";

export type DonorResponseStatus =
  | "Dador a Caminho"
  | "Chegou"
  | "PIN Validado"
  | "Doação concluída"
  | "Cancelado"
  | "Não Compareceu";

export type DonorEligibilityStatus =
  | "Elegível"
  | "Verificação Pendente"
  | "Diferido Temporário"
  | "Diferido Permanente"
  | "Revisão Necessária"
  | "eligible"
  | "pending_verification"
  | "temporarily_deferred"
  | "permanently_deferred"
  | "needs_review";

export type HospitalVerificationStatus =
  | "Revisão Necessária"
  | "Pendente"
  | "Verificado"
  | "Rejeitado"
  | "Suspenso"
  | "needs_review"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export type Donor = {
  id: string;
  userId?: string;
  name: string;
  bloodType: BloodType;
  province: string;
  municipality: string;
  available: boolean;
  lastDonation: string;
  consentAcceptedAt?: string;
  consentVersion?: string;
  latitude?: number;
  locationPermissionStatus?: string;
  longitude?: number;
  nextEligibleDonationDate?: string;
  points: number;
  reliabilityScore?: number;
  responseSpeedMinutes?: number;
  totalDonations?: number;
  eligibilityStatus?: DonorEligibilityStatus;
  birthDate?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  gender?: string;
  phone?: string;
  preferredHospitalId?: string;
};

export type Hospital = {
  id: string;
  address?: string;
  name: string;
  type?: string;
  email?: string;
  licenseNumber?: string;
  province: string;
  municipality: string;
  verified: boolean;
  verificationStatus?: HospitalVerificationStatus;
  rejectionReason?: string;
  capacity: number;
  contact: string;
  latitude?: number;
  longitude?: number;
};

export type BloodRequest = {
  id: string;
  hospitalId: string;
  patientCode: string;
  bloodType: BloodType;
  units: number;
  urgency: Urgency;
  province?: string;
  municipality?: string;
  notes?: string;
  status: RequestStatus;
  createdBy?: string;
  createdAt: string;
  acceptedCount?: number;
  distanceKm?: number;
  etaMinutes?: number;
  hospitalName?: string;
  hospitalLocation?: string;
  remainingSlots?: number;
  requestSource?: "hospital" | "family";
  familyRequestId?: string;
};

export type Appointment = {
  id: string;
  donorId: string;
  hospitalId: string;
  bloodRequestId?: string;
  createdAt?: string;
  date: string;
  time: string;
  pin: string;
  status: "Cancelado" | "Chegou" | "Confirmado" | "Concluido" | "Pendente" | "PIN Validado";
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
