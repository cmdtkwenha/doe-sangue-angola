import { apiResponse } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../_utils/security";

type Row = Record<string, string>;
type Filters = {
  bloodType: string;
  dateFrom: string;
  dateTo: string;
  hospital: string;
  municipality: string;
  province: string;
  status: string;
};
type Report = {
  description: string;
  id: string;
  rows: Row[];
  summary: Array<[string, string]>;
  title: string;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    const params = new URL(request.url).searchParams;
    const role = params.get("role") === "hospital" ? "hospital" : "admin";
    const principal = await requireApiSession(role === "admin" ? ["admin"] : ["hospital", "admin"]);
    const db = await createRouteSupabase();
    const filters = readFilters(params);
    const [donors, hospitals, requests, responses, inventory, movements] = await Promise.all([
      read(db, "donors", "id,blood_type,province,municipality,available,eligibility_status,created_at"),
      read(db, "hospitals", "id,name,province,municipality,verified,verification_status,created_at"),
      read(db, "blood_requests", "id,hospital_id,blood_type,units_needed,urgency,status,province,municipality,created_at"),
      read(db, "donor_responses", "id,donor_id,blood_request_id,hospital_id,status,eta_minutes,created_at,completed_at,donation_completed_at"),
      read(db, "hospital_inventory", "hospital_id,blood_type,units_available,minimum_threshold,critical_threshold,safe_minimum,updated_at"),
      read(db, "inventory_movements", "hospital_id,blood_type,movement_type,units,created_at")
    ]);
    const scopedHospital = role === "hospital" ? principal.hospitalId : filters.hospital;
    const base = filterRows({ filters, hospitalId: scopedHospital, hospitals, inventory, movements, requests, responses });
    return role === "admin"
      ? adminReports({ ...base, donors: filterDonors(donors, filters), hospitals: filterHospitals(hospitals, filters) })
      : hospitalReports(base);
  });
}

async function read(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, columns: string) {
  const { data, error } = await db.from(table).select(columns).limit(5000);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return (data ?? []) as Array<Record<string, any>>;
}

function readFilters(params: URLSearchParams): Filters {
  return {
    bloodType: params.get("bloodType") ?? "",
    dateFrom: params.get("dateFrom") ?? "",
    dateTo: params.get("dateTo") ?? "",
    hospital: params.get("hospital") ?? "",
    municipality: params.get("municipality") ?? "",
    province: params.get("province") ?? "",
    status: params.get("status") ?? ""
  };
}

function filterRows(input: {
  filters: Filters;
  hospitalId?: string;
  hospitals: Array<Record<string, any>>;
  inventory: Array<Record<string, any>>;
  movements: Array<Record<string, any>>;
  requests: Array<Record<string, any>>;
  responses: Array<Record<string, any>>;
}) {
  const f = input.filters;
  const requests = input.requests
    .filter((row) => !input.hospitalId || row.hospital_id === input.hospitalId)
    .filter((row) => matchCommon(row, f));
  const requestIds = new Set(requests.map((row) => row.id));
  return {
    hospitals: input.hospitals,
    inventory: input.inventory.filter((row) => !input.hospitalId || row.hospital_id === input.hospitalId).filter((row) => matchBlood(row, f)),
    movements: input.movements.filter((row) => !input.hospitalId || row.hospital_id === input.hospitalId).filter((row) => matchDate(row, f) && matchBlood(row, f)),
    requests,
    responses: input.responses
      .filter((row) => !input.hospitalId || row.hospital_id === input.hospitalId)
      .filter((row) => !requestIds.size || requestIds.has(row.blood_request_id))
      .filter((row) => matchDate(row, f) && (!f.status || row.status === f.status))
  };
}

function adminReports(data: ReturnType<typeof filterRows> & { donors: Row[]; hospitals: Row[] }): Report[] {
  return [
    report("donors-province", "Dadores por província", "Distribuição real de dadores.", groupRows(data.donors, "province", "Dadores")),
    report("hospitals-province", "Hospitais por província", "Hospitais registados por província.", groupRows(data.hospitals, "province", "Hospitais")),
    report("requests-status", "Pedidos por estado", "Pedidos de sangue agrupados por estado.", groupRows(data.requests, "status", "Pedidos")),
    report("completed-donations", "Doações concluídas", "Respostas concluídas no período.", rowsByStatus(data.responses, "Doação concluída")),
    report("cancelled-responses", "Respostas canceladas", "Respostas de dadores canceladas.", rowsByStatus(data.responses, "Cancelado")),
    report("blood-demand", "Procura por tipo sanguíneo", "Unidades pedidas por tipo.", demandRows(data.requests)),
    report("inventory-shortages", "Escassez de inventário", "Stock abaixo dos limites.", shortageRows(data.inventory))
  ];
}

function hospitalReports(data: ReturnType<typeof filterRows>): Report[] {
  return [
    report("hospital-requests", "Pedidos criados", "Pedidos criados pelo hospital.", requestRows(data.requests)),
    report("donors-accepted", "Dadores aceites", "Dadores aceites por pedido.", rowsByStatus(data.responses, "Dador a Caminho")),
    report("donations-completed", "Doações concluídas", "Doações concluídas pelo hospital.", rowsByStatus(data.responses, "Doação concluída")),
    report("average-eta", "ETA médio", "Tempo médio estimado dos dadores.", etaRows(data.responses)),
    report("inventory-movements", "Movimentos de inventário", "Entradas, consumo, expiração e ajustes.", movementRows(data.movements)),
    report("blood-shortages", "Escassez por tipo sanguíneo", "Tipos abaixo dos limites.", shortageRows(data.inventory))
  ];
}

function report(id: string, title: string, description: string, rows: Row[]): Report {
  return {
    description,
    id,
    rows,
    summary: [["Registos", String(rows.length)], ["Fonte", "Supabase"], ["Estado", rows.length ? "Com dados" : "Sem dados"]],
    title
  };
}

function groupRows(rows: Array<Record<string, any>>, key: string, label: string): Row[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(row[key] || "Sem valor", (totals.get(row[key] || "Sem valor") ?? 0) + 1));
  return Array.from(totals, ([name, total]) => ({ Categoria: name, [label]: String(total) }));
}

function rowsByStatus(rows: Array<Record<string, any>>, status: string): Row[] {
  return rows.filter((row) => row.status === status).map((row) => ({
    ID: row.id,
    Pedido: row.blood_request_id ?? "",
    Estado: row.status,
    Data: date(row.completed_at ?? row.donation_completed_at ?? row.created_at)
  }));
}

function demandRows(rows: Array<Record<string, any>>): Row[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(row.blood_type, (totals.get(row.blood_type) ?? 0) + Number(row.units_needed ?? 1)));
  return Array.from(totals, ([type, units]) => ({ "Tipo sanguíneo": type, "Bolsas pedidas": String(units) }));
}

function shortageRows(rows: Array<Record<string, any>>): Row[] {
  return rows.filter((row) => Number(row.units_available ?? 0) < Number(row.minimum_threshold ?? row.safe_minimum ?? 0)).map((row) => ({
    Hospital: row.hospital_id ?? "",
    Tipo: row.blood_type,
    Stock: String(row.units_available ?? 0),
    Mínimo: String(row.minimum_threshold ?? row.safe_minimum ?? 0),
    Crítico: String(row.critical_threshold ?? "")
  }));
}

function requestRows(rows: Array<Record<string, any>>): Row[] {
  return rows.map((row) => ({ ID: row.id, Tipo: row.blood_type, Bolsas: String(row.units_needed ?? 1), Estado: row.status, Data: date(row.created_at) }));
}

function movementRows(rows: Array<Record<string, any>>): Row[] {
  return rows.map((row) => ({ Tipo: row.blood_type, Movimento: row.movement_type, Unidades: String(row.units), Data: date(row.created_at) }));
}

function etaRows(rows: Array<Record<string, any>>): Row[] {
  const values = rows.map((row) => Number(row.eta_minutes ?? 0)).filter(Boolean);
  const avg = values.length ? Math.round(values.reduce((sum, item) => sum + item, 0) / values.length) : 0;
  return [{ Métrica: "ETA médio", Valor: `${avg} min`, Amostra: String(values.length) }];
}

function filterDonors(rows: Array<Record<string, any>>, f: Filters) {
  return rows.filter((row) => matchCommon(row, f));
}

function filterHospitals(rows: Array<Record<string, any>>, f: Filters) {
  return rows.filter((row) => matchCommon(row, f));
}

function matchCommon(row: Record<string, any>, f: Filters) {
  return matchDate(row, f) && matchBlood(row, f)
    && (!f.province || row.province === f.province)
    && (!f.municipality || row.municipality === f.municipality)
    && (!f.status || row.status === f.status);
}

function matchBlood(row: Record<string, any>, f: Filters) {
  return !f.bloodType || row.blood_type === f.bloodType;
}

function matchDate(row: Record<string, any>, f: Filters) {
  const value = String(row.created_at ?? row.updated_at ?? "");
  return (!f.dateFrom || value >= f.dateFrom) && (!f.dateTo || value.slice(0, 10) <= f.dateTo);
}

function date(value: string) {
  return value ? new Date(value).toLocaleDateString("pt-AO") : "";
}
