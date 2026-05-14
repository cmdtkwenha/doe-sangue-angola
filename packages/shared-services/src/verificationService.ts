import { fraudAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { auditLogs, donors, hospitals, requests } from "./mockStore";
import { recordAudit } from "./auditService";

export type VerificationStatus =
  | "Verificado"
  | "Pendente"
  | "Rejeitado"
  | "Revisão Necessária";

export type VerificationItem = {
  id: string;
  entity: string;
  kind: "Hospital" | "Dador";
  status: VerificationStatus;
  province: string;
  reason: string;
};

export type FraudReviewItem = {
  id: string;
  entity: string;
  risk: "baixo" | "medio" | "alto";
  score: number;
  flags: string[];
  status: VerificationStatus;
};

const verificationStatusByHospital: Record<string, VerificationStatus> = {
  h1: "Verificado",
  h2: "Pendente",
  h3: "Revisão Necessária"
};

const verificationStatusByDonor: Record<string, VerificationStatus> = {
  d1: "Verificado",
  d2: "Pendente",
  d3: "Revisão Necessária",
  d4: "Verificado"
};

// TODO(production): persist verification state in Supabase with admin-only policies.
export function listHospitalVerificationQueue(): VerificationItem[] {
  return hospitals.map((hospital) => buildHospitalVerification(hospital));
}

export function listDonorVerificationQueue(): VerificationItem[] {
  return donors.map((donor) => buildDonorVerification(donor));
}

export function listVerificationQueue() {
  return [
    ...listHospitalVerificationQueue(),
    ...listDonorVerificationQueue()
  ].filter((item) => item.status !== "Verificado");
}

export function listFraudReviewQueue(): FraudReviewItem[] {
  return [
    ...requests.map(buildRequestRisk),
    ...detectDuplicateDonors()
  ].sort((a, b) => b.score - a.score);
}

export function getNationalRiskScore() {
  const queue = listFraudReviewQueue();
  const total = queue.reduce((sum, item) => sum + item.score, 0);
  const score = Math.round(total / Math.max(queue.length, 1));

  return {
    score,
    level: score >= 70 ? "alto" : score >= 35 ? "medio" : "baixo",
    openReviews: queue.length,
    verifiedHospitals: hospitals.filter((item) => item.verified).length
  };
}

export function approveVerification(id: string) {
  recordAudit("Admin Nacional", `Aprovou verificação ${id}`);
  return { ok: true, status: "Verificado" as VerificationStatus };
}

export function rejectVerification(id: string) {
  recordAudit("Admin Nacional", `Rejeitou verificação ${id}`);
  return { ok: true, status: "Rejeitado" as VerificationStatus };
}

function buildHospitalVerification(hospital: Hospital): VerificationItem {
  const status = verificationStatusByHospital[hospital.id] ?? "Pendente";

  return {
    id: hospital.id,
    entity: hospital.name,
    kind: "Hospital",
    status,
    province: hospital.province,
    reason: status === "Verificado" ? "Documentos aprovados" : "Licença pendente"
  };
}

function buildDonorVerification(donor: Donor): VerificationItem {
  const status = verificationStatusByDonor[donor.id] ?? "Pendente";

  return {
    id: donor.id,
    entity: donor.name,
    kind: "Dador",
    status,
    province: donor.province,
    reason: status === "Verificado" ? "Identidade confirmada" : "Confirmar BI e contacto"
  };
}

function buildRequestRisk(request: BloodRequest): FraudReviewItem {
  const result = fraudAgent(request);
  const risk = normalizeRisk(result.risk);
  const baseScore = risk === "alto" ? 86 : risk === "medio" ? 54 : 18;
  const flags = result.flags.length ? result.flags : ["Sem sinais fortes"];

  return {
    id: `REQ-${request.id}`,
    entity: `${request.bloodType} · ${request.patientCode}`,
    risk,
    score: baseScore,
    flags,
    status: risk === "baixo" ? "Verificado" : "Revisão Necessária"
  };
}

function normalizeRisk(risk: string): FraudReviewItem["risk"] {
  if (risk === "alto" || risk === "medio") return risk;
  return "baixo";
}

function detectDuplicateDonors(): FraudReviewItem[] {
  const seen = new Map<string, Donor>();
  const duplicates: FraudReviewItem[] = [];

  donors.forEach((donor) => {
    const key = `${donor.name.toLowerCase()}-${donor.bloodType}-${donor.province}`;
    const previous = seen.get(key);
    if (previous) {
      duplicates.push({
        id: `DUP-${donor.id}`,
        entity: `${donor.name} / ${previous.name}`,
        risk: "medio",
        score: 58,
        flags: ["Possível dador duplicado"],
        status: "Revisão Necessária"
      });
    }
    seen.set(key, donor);
  });

  if (!duplicates.length && !auditLogs.some((log) => log.action.includes("duplicado"))) {
    recordAudit("fraudAgent", "Executou deteção de dadores duplicados");
  }

  return duplicates;
}
