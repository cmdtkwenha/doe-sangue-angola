import { bloodTypes, minimumStockByType } from "@doe-sangue-angola/shared-services";
import type { BloodType } from "@doe-sangue-angola/shared-types";
import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";
import { sampleNationalOperations } from "./sample";

const closed = new Set(["Cancelado", "Concluído", "Concluido"]);
const criticalUrgency = new Set(["Critica", "Desastre"]);

type DonorRow = {
  available: boolean | null;
  eligibility_status: string | null;
  province: string | null;
};
type HospitalRow = {
  id: string;
  municipality: string | null;
  province: string | null;
  verification_status: string | null;
  verified: boolean | null;
};
type RequestRow = {
  blood_type: BloodType;
  created_at: string;
  municipality: string | null;
  province: string | null;
  status: string;
  units: number | null;
  units_needed: number | null;
  urgency: string;
};
type ResponseRow = {
  created_at: string;
  donation_completed_at: string | null;
  completed_at: string | null;
  hospital_id: string | null;
  status: string;
};
type InventoryRow = {
  blood_type: BloodType;
  safe_minimum: number | null;
  units_available: number | null;
};
type AuditRow = {
  action: string;
  actor_label: string;
  created_at: string;
  id: string;
};

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [donors, hospitals, requests, responses, inventory, audits] = await Promise.all([
      read<DonorRow>(db, "donors", "available,eligibility_status,province"),
      read<HospitalRow>(db, "hospitals", "id,verified,verification_status,province,municipality"),
      read<RequestRow>(db, "blood_requests", "blood_type,units,units_needed,urgency,status,province,municipality,created_at"),
      read<ResponseRow>(db, "donor_responses", "status,hospital_id,created_at,completed_at,donation_completed_at"),
      read<InventoryRow>(db, "hospital_inventory", "blood_type,units_available,safe_minimum"),
      read<AuditRow>(db, "audit_logs", "id,actor_label,action,created_at")
    ]);
    if (!donors.length && !requests.length && !responses.length) return sampleNationalOperations();
    return buildNationalOperations({ audits, donors, hospitals, inventory, requests, responses });
  });
}

async function read<T>(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, columns: string) {
  const { data, error } = await db.from(table).select(columns);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return (data ?? []) as T[];
}

function buildNationalOperations(input: {
  audits: AuditRow[];
  donors: DonorRow[];
  hospitals: HospitalRow[];
  inventory: InventoryRow[];
  requests: RequestRow[];
  responses: ResponseRow[];
}) {
  const activeRequests = input.requests.filter((item) => !closed.has(item.status));
  const criticalRequests = activeRequests.filter((item) => criticalUrgency.has(item.urgency));
  const completed = input.responses.filter((item) => item.status === "Doação concluída");
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const verifiedHospitals = input.hospitals.filter(isVerifiedHospital);
  const activeDonors = input.donors.filter((item) => item.available && item.eligibility_status !== "temporarily_deferred");
  return {
    alerts: buildAlerts(input.inventory, criticalRequests),
    auditTrail: buildAudit(input.audits),
    bloodTypes: buildBloodTypes(input.inventory, activeRequests),
    metrics: [
      metric("Total de dadores", input.donors.length, "Registos reais", "green"),
      metric("Dadores ativos", activeDonors.length, "Elegíveis/ativos", "green"),
      metric("Hospitais verificados", verifiedHospitals.length, "Aprovados", "black"),
      metric("Pedidos abertos", activeRequests.length, "Em operação", "red"),
      metric("Pedidos críticos", criticalRequests.length, "Críticos/desastre", "red"),
      metric("Doações hoje", completed.filter((item) => completionDate(item).startsWith(today)).length, today, "gold"),
      metric("Doações no mês", completed.filter((item) => completionDate(item).startsWith(month)).length, month, "green")
    ],
    municipalities: buildAreas(input.requests, input.hospitals, completed, "municipality"),
    provinces: buildAreas(input.requests, input.hospitals, completed, "province"),
    rankings: buildRankings(input.donors, input.hospitals, completed),
    sampleMode: false
  };
}

function metric(label: string, value: number, change: string, tone: "red" | "gold" | "black" | "green") {
  return { change, label, tone, value: String(value) };
}

function buildBloodTypes(inventory: InventoryRow[], requests: RequestRow[]) {
  return bloodTypes.map((bloodType) => {
    const rows = inventory.filter((item) => item.blood_type === bloodType);
    const units = rows.reduce((sum, row) => sum + Number(row.units_available ?? 0), 0);
    const safeMinimum = rows.reduce((sum, row) => sum + Number(row.safe_minimum ?? 0), 0) || minimumStockByType[bloodType];
    const demand = requests.filter((item) => item.blood_type === bloodType).reduce((sum, item) => sum + Number(item.units_needed ?? item.units ?? 1), 0);
    const ratio = units / Math.max(1, safeMinimum);
    const status = ratio < 0.45 || demand > units ? "critical" : ratio < 0.8 ? "warning" : ratio > 1.5 ? "surplus" : "stable";
    return { bloodType, demand, safeMinimum, status, units };
  });
}

function buildAlerts(inventory: InventoryRow[], criticalRequests: RequestRow[]) {
  const lowInventory = buildBloodTypes(inventory, criticalRequests).filter((item) => item.status === "critical");
  return [
    ...lowInventory.slice(0, 4).map((item) => ({
      id: `stock-${item.bloodType}`,
      message: `${item.units}/${item.safeMinimum} unidades disponíveis.`,
      severity: "critical" as const,
      title: `Inventário baixo de ${item.bloodType}`
    })),
    ...criticalRequests.slice(0, 4).map((item) => ({
      id: `request-${item.created_at}-${item.blood_type}`,
      message: `${item.units_needed ?? item.units ?? 1} bolsas em ${item.municipality ?? item.province ?? "Angola"}.`,
      severity: item.urgency === "Desastre" ? "critical" as const : "warning" as const,
      title: `Pedido ${item.urgency.toLowerCase()} ${item.blood_type}`
    }))
  ];
}

function buildAreas(requests: RequestRow[], hospitals: HospitalRow[], responses: ResponseRow[], key: "province" | "municipality") {
  const names = new Set([...requests.map((item) => item[key]), ...hospitals.map((item) => item[key])].filter(Boolean) as string[]);
  const hospitalAreas = new Map(hospitals.map((item) => [item.id, item[key]]));
  return Array.from(names).map((name) => {
    const areaRequests = requests.filter((item) => item[key] === name && !closed.has(item.status));
    const critical = areaRequests.filter((item) => criticalUrgency.has(item.urgency)).length;
    const hospitalsTotal = hospitals.filter((item) => item[key] === name && isVerifiedHospital(item)).length;
    const donations = responses.filter((item) => item.status === "Doação concluída" && hospitalAreas.get(item.hospital_id ?? "") === name).length;
    const level = critical ? "critical" : areaRequests.length > hospitalsTotal ? "warning" : hospitalsTotal > areaRequests.length + 2 ? "surplus" : "stable";
    return { critical, donations, hospitals: hospitalsTotal, level, name, requests: areaRequests.length, surplus: Math.max(0, hospitalsTotal - areaRequests.length) };
  }).sort((a, b) => b.critical - a.critical || b.requests - a.requests).slice(0, 12);
}

function buildRankings(donors: DonorRow[], hospitals: HospitalRow[], responses: ResponseRow[]) {
  const provinces = new Set([...donors.map((item) => item.province), ...hospitals.map((item) => item.province)].filter(Boolean) as string[]);
  const hospitalProvinces = new Map(hospitals.map((item) => [item.id, item.province]));
  return Array.from(provinces).map((province) => ({
    activeDonors: donors.filter((item) => item.province === province && item.available).length,
    donations: responses.filter((item) => item.status === "Doação concluída" && hospitalProvinces.get(item.hospital_id ?? "") === province).length,
    hospitals: hospitals.filter((item) => item.province === province && isVerifiedHospital(item)).length,
    province
  })).sort((a, b) => b.donations - a.donations || b.activeDonors - a.activeDonors).slice(0, 8);
}

function buildAudit(audits: AuditRow[]) {
  return audits.slice(0, 8).map((item) => ({
    action: item.action,
    actor: item.actor_label,
    id: item.id,
    time: new Date(item.created_at).toLocaleString("pt-PT")
  }));
}

function isVerifiedHospital(item: HospitalRow) {
  return item.verified && (item.verification_status ?? "verified") === "verified";
}

function completionDate(item: ResponseRow) {
  return item.completed_at ?? item.donation_completed_at ?? item.created_at ?? "";
}
