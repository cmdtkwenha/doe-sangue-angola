import { apiResponse } from "../../_utils/apiResponse";
import { DONOR_ELIGIBILITY_STATUS } from "@doe-sangue-angola/shared-types";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type Hospital = { facility_type?: string | null; hospital_type?: string | null; id: string; municipality?: string | null; name: string; province?: string | null; status?: string | null; verification_status?: string | null; verified?: boolean | null };
type Donor = { id: string; municipality?: string | null; province?: string | null; user_id?: string | null; eligibility_status?: string | null; available?: boolean | null };
type Request = { accepted_count?: number | null; blood_type: string; hospital_id: string; id: string; remaining_slots?: number | null; status: string; units_needed?: number | null; urgency?: string | null };
type Response = { completed_at?: string | null; created_at: string; donation_completed_at?: string | null; donor_id: string; eta_minutes?: number | null; hospital_id: string; status: string };
type User = { id: string; name?: string | null };
type Audit = { action: string; created_at: string; id: string };
type Fraud = { id: string; status?: string | null };

const activeStatuses = ["Aberto", "Em Correspondência", "Dador a Caminho", "PIN Validado"];
const pendingStatuses: string[] = [
  DONOR_ELIGIBILITY_STATUS.PENDENTE,
  DONOR_ELIGIBILITY_STATUS.REVISAO_NECESSARIA
];
const criticalUrgencies = ["Crítica", "Critica", "Desastre"];

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [hospitals, donors, requests, responses, users, audits, fraud] = await Promise.all([
      read<Hospital>(db, "hospitals", "id,name,hospital_type,facility_type,province,municipality,verified,verification_status,status"),
      read<Donor>(db, "donors", "id,user_id,province,municipality,available,eligibility_status"),
      read<Request>(db, "blood_requests", "id,hospital_id,blood_type,units_needed,accepted_count,remaining_slots,urgency,status"),
      read<Response>(db, "donor_responses", "donor_id,hospital_id,status,eta_minutes,created_at,completed_at,donation_completed_at"),
      read<User>(db, "users", "id,name"),
      read<Audit>(db, "audit_logs", "id,action,created_at"),
      read<Fraud>(db, "fraud_reviews", "id,status")
    ]);
    return build({ audits, donors, fraud, hospitals, requests, responses, users });
  });
}

async function read<T>(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, columns: string) {
  const { data, error } = await db.from(table).select(columns);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return (data ?? []) as T[];
}

function build(input: {
  audits: Audit[];
  donors: Donor[];
  fraud: Fraud[];
  hospitals: Hospital[];
  requests: Request[];
  responses: Response[];
  users: User[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const activeRequests = input.requests.filter((item) => activeStatuses.includes(item.status));
  const activeResponses = input.responses.filter((item) => ["Dador a Caminho", "Chegou", "PIN Validado"].includes(item.status));
  const completed = input.responses.filter((item) => item.status === "Doação concluída");
  const verifiedHospitals = input.hospitals.filter(isVerified);
  const pendingHospitals = input.hospitals.filter((item) => pendingStatuses.includes(statusOf(item)));
  const verifiedDonors = input.donors.filter((item) => item.eligibility_status === DONOR_ELIGIBILITY_STATUS.ELEGIVEL);
  const pendingDonors = input.donors.filter((item) => pendingStatuses.includes(item.eligibility_status ?? ""));
  return {
    filters: {
      bloodTypes: unique(input.requests.map((item) => item.blood_type)),
      municipalities: unique(input.hospitals.map((item) => item.municipality)),
      priorities: unique(input.requests.map((item) => item.urgency)),
      provinces: unique(input.hospitals.map((item) => item.province))
    },
    health: {
      criticalErrors: input.fraud.filter((item) => item.status === "Alto").length,
      database: "Base de dados operacional",
      score: input.fraud.some((item) => item.status === "Suspenso") ? 72 : 96,
      status: "Sistema operacional",
      supabase: "Supabase ligado"
    },
    mapItems: mapItems(input.hospitals, activeRequests),
    metrics: [
      metric("Hospitais Verificados", verifiedHospitals.length),
      metric("Hospitais Pendentes", pendingHospitals.length),
      metric("Dadores Verificados", verifiedDonors.length),
      metric("Dadores Pendentes", pendingDonors.length),
      metric("Pedidos Ativos", activeRequests.length),
      metric("Dadores a Caminho", activeResponses.length),
      metric("Doações Concluídas Hoje", completed.filter((item) => doneAt(item).startsWith(today)).length),
      metric("Doações Concluídas Este Mês", completed.filter((item) => doneAt(item).startsWith(month)).length),
      metric("Pedidos Críticos", activeRequests.filter((item) => criticalUrgencies.includes(item.urgency ?? "")).length),
      metric("Alertas de Fraude", input.fraud.filter((item) => item.status !== "Verificado").length)
    ],
    monitoring: input.audits
      .filter((item) => monitored(item.action))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 8)
      .map((item) => ({ action: item.action, id: item.id, time: new Date(item.created_at).toLocaleString("pt-AO") })),
    tables: {
      activeRequests: activeRequests.map((item) => ({
        accepted: item.accepted_count ?? 0,
        bloodType: item.blood_type,
        hospital: hospitalName(input.hospitals, item.hospital_id),
        id: item.id,
        needed: item.units_needed ?? 1,
        remaining: item.remaining_slots ?? 0,
        urgency: item.urgency ?? "Normal",
        status: item.status
      })),
      incomingDonors: activeResponses.map((item) => ({
        donor: donorName(input.donors, input.users, item.donor_id),
        eta: item.eta_minutes ? `${item.eta_minutes} min` : "Sem ETA",
        hospital: hospitalName(input.hospitals, item.hospital_id),
        id: `${item.donor_id}-${item.created_at}`,
        status: item.status
      })),
      topDonors: topDonors(input.responses, input.donors, input.users),
      topHospitals: topHospitals(input.requests, input.hospitals)
    }
  };
}

function metric(label: string, value: number) {
  return { label, value: String(value) };
}

function isVerified(item: Hospital) {
  return item.verified === true || item.verification_status === "Verificado" || item.status === "Verificado";
}

function statusOf(item: Hospital) {
  return item.verification_status ?? item.status ?? (item.verified ? "Verificado" : "Pendente");
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((item): item is string => Boolean(item)))).sort();
}

function mapItems(hospitals: Hospital[], requests: Request[]) {
  const facilities = hospitals.map((item) => ({
    id: item.id,
    municipality: item.municipality ?? "Sem município",
    name: item.name,
    province: item.province ?? "Sem província",
    type: item.hospital_type ?? item.facility_type ?? "Hospital"
  }));
  const active = requests.map((item) => ({
    id: item.id,
    municipality: hospitals.find((row) => row.id === item.hospital_id)?.municipality ?? "Sem município",
    name: `Pedido ${item.blood_type}`,
    province: hospitals.find((row) => row.id === item.hospital_id)?.province ?? "Sem província",
    type: "Pedido ativo"
  }));
  return [...facilities, ...active];
}

function hospitalName(hospitals: Hospital[], id: string) {
  return hospitals.find((item) => item.id === id)?.name ?? "Hospital não identificado";
}

function donorName(donors: Donor[], users: User[], id: string) {
  const donor = donors.find((item) => item.id === id);
  return users.find((item) => item.id === donor?.user_id)?.name ?? "Dador não identificado";
}

function doneAt(item: Response) {
  return item.completed_at ?? item.donation_completed_at ?? "";
}

function monitored(action: string) {
  return ["Criou pedido", "Aceitou pedido", "Validou PIN", "Concluiu doação", "Doação concluída"].some((word) => action.includes(word));
}

function topHospitals(requests: Request[], hospitals: Hospital[]) {
  return topBy(requests.map((item) => item.hospital_id)).map((item) => ({
    count: item.count,
    id: item.id,
    name: hospitalName(hospitals, item.id)
  }));
}

function topDonors(responses: Response[], donors: Donor[], users: User[]) {
  return topBy(responses.filter((item) => item.status === "Doação concluída").map((item) => item.donor_id)).map((item) => ({
    count: item.count,
    id: item.id,
    name: donorName(donors, users, item.id)
  }));
}

function topBy(ids: string[]) {
  const counts = ids.reduce((map, id) => map.set(id, (map.get(id) ?? 0) + 1), new Map<string, number>());
  return Array.from(counts.entries())
    .map(([id, count]) => ({ count, id }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
