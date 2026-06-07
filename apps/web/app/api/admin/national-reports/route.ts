import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type Donor = { available?: boolean | null; blood_type?: string | null; eligibility_status?: string | null; id: string; municipality?: string | null; province?: string | null; reliability_score?: number | null; user_id?: string | null };
type Hospital = { id: string; municipality?: string | null; name: string; province?: string | null; verification_status?: string | null; verified?: boolean | null };
type BloodRequestRow = { blood_type: string; created_at: string; hospital_id: string; id: string; municipality?: string | null; province?: string | null; remaining_slots?: number | null; status: string; units_needed?: number | null; urgency?: string | null };
type Response = { completed_at?: string | null; created_at: string; donation_completed_at?: string | null; donor_id: string; hospital_id: string; status: string };
type Inventory = { blood_type: string; hospital_id: string; minimum_threshold?: number | null; safe_minimum?: number | null; units_available?: number | null };
type User = { id: string; name?: string | null };

export async function GET(request: Request) {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const params = new URL(request.url).searchParams;
    const db = await createRouteSupabase();
    const [donors, hospitals, requests, responses, inventory, users] = await Promise.all([
      read<Donor>(db, "donors", "id,user_id,blood_type,province,municipality,available,eligibility_status,reliability_score"),
      read<Hospital>(db, "hospitals", "id,name,province,municipality,verified,verification_status"),
      read<BloodRequestRow>(db, "blood_requests", "id,hospital_id,blood_type,units_needed,urgency,status,province,municipality,remaining_slots,created_at"),
      read<Response>(db, "donor_responses", "donor_id,hospital_id,status,created_at,completed_at,donation_completed_at"),
      read<Inventory>(db, "hospital_inventory", "hospital_id,blood_type,units_available,minimum_threshold,safe_minimum"),
      read<User>(db, "users", "id,name")
    ]);
    const scoped = scope({ donors, hospitals, inventory, requests, responses }, params);
    return build(scoped, users);
  });
}

async function read<T>(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, columns: string) {
  const { data, error } = await db.from(table).select(columns).limit(10000);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return (data ?? []) as T[];
}

function scope(data: {
  donors: Donor[];
  hospitals: Hospital[];
  inventory: Inventory[];
  requests: BloodRequestRow[];
  responses: Response[];
}, params: URLSearchParams) {
  const province = params.get("province") ?? "";
  const municipality = params.get("municipality") ?? "";
  const hospital = params.get("hospital") ?? "";
  const hospitalIds = new Set(data.hospitals
    .filter((item) => (!province || item.province === province) && (!municipality || item.municipality === municipality) && (!hospital || item.id === hospital))
    .map((item) => item.id));
  return {
    donors: data.donors.filter((item) => (!province || item.province === province) && (!municipality || item.municipality === municipality)),
    hospitals: data.hospitals.filter((item) => hospitalIds.has(item.id)),
    inventory: data.inventory.filter((item) => hospitalIds.has(item.hospital_id)),
    requests: data.requests.filter((item) => hospitalIds.has(item.hospital_id)),
    responses: data.responses.filter((item) => hospitalIds.has(item.hospital_id))
  };
}

function build(data: ReturnType<typeof scope>, users: User[]) {
  const completed = data.responses.filter((item) => item.status === "Doação concluída");
  const cancelled = data.responses.filter((item) => item.status === "Cancelado");
  const noShows = data.responses.filter((item) => item.status === "Não Compareceu");
  const open = data.requests.filter((item) => !["Cancelado", "Concluído"].includes(item.status));
  return {
    filters: {
      hospitals: data.hospitals.map((item) => ({ id: item.id, name: item.name })),
      municipalities: unique(data.hospitals.map((item) => item.municipality)),
      provinces: unique(data.hospitals.map((item) => item.province))
    },
    reports: [
      section("Relatórios de Doações", [
        metric("Total de doações", completed.length),
        metric("Doações por mês", groupMonth(completed).length),
        metric("Províncias com doações", group(data.hospitals, "province").length),
        metric("Municípios com doações", group(data.hospitals, "municipality").length)
      ], {
        "Tendência mensal": groupMonth(completed),
        "Comparação por província": groupByHospitalArea(completed, data.hospitals, "province", "Doações"),
        "Distribuição por tipo sanguíneo": demand(data.requests, "Doações")
      }),
      section("Relatórios de Dadores", [
        metric("Dadores registados", data.donors.length),
        metric("Dadores verificados", data.donors.filter((item) => item.eligibility_status === "Verificado").length),
        metric("Dadores ativos", data.donors.filter((item) => item.available).length),
        metric("Dadores suspensos", data.donors.filter((item) => item.eligibility_status === "Suspenso").length)
      ], { "Dadores por província": group(data.donors, "province"), "Dadores por município": group(data.donors, "municipality") }),
      section("Relatórios de Hospitais", [
        metric("Hospitais registados", data.hospitals.length),
        metric("Hospitais verificados", data.hospitals.filter((item) => item.verified || item.verification_status === "Verificado").length),
        metric("Hospitais ativos", activeHospitals(data.requests).length),
        metric("Hospitais com pedidos", topHospitals(data.requests, data.hospitals).length)
      ], { "Hospitais mais ativos": topHospitals(data.requests, data.hospitals) }),
      section("Procura de Sangue", [
        metric("Tipo mais pedido", topBlood(data.requests)),
        metric("Escassez crítica", shortages(data.inventory).length),
        metric("Tempo médio de atendimento", averageFulfillment(data.requests, completed)),
        metric("Taxa de aceitação", acceptanceRate(data.responses))
      ], { "Tipos sanguíneos mais pedidos": demand(data.requests, "Pedidos"), "Escassez crítica": shortages(data.inventory) }),
      section("Confiabilidade", [
        metric("Dadores mais ativos", topDonors(completed, data.donors, users).length),
        metric("Dadores faltosos", noShows.length),
        metric("Taxa de cancelamento", rate(cancelled.length, data.responses.length)),
        metric("Distribuição de confiabilidade", reliability(data.donors).length)
      ], { "Top dadores": topDonors(completed, data.donors, users), "Distribuição de confiabilidade": reliability(data.donors) }),
      section("Painel Provincial", [
        metric("Pedidos", data.requests.length),
        metric("Doações", completed.length),
        metric("Inventário", sum(data.inventory.map((item) => Number(item.units_available ?? 0)))),
        metric("Dadores ativos", data.donors.filter((item) => item.available).length)
      ], { "Pedidos ativos": open.map((item) => ({ Categoria: item.blood_type, Valor: String(item.units_needed ?? 1) })) })
    ]
  };
}

function section(title: string, metrics: Array<{ label: string; value: string }>, charts: Record<string, Array<Record<string, string>>>) {
  return { charts, metrics, title };
}

function metric(label: string, value: number | string) {
  return { label, value: String(value) };
}

function group(rows: Array<Record<string, any>>, key: string): Array<Record<string, string>> {
  const totals = rows.reduce<Map<string, number>>((map, row) => map.set(row[key] || "Sem valor", (map.get(row[key] || "Sem valor") ?? 0) + 1), new Map());
  return Array.from(totals, ([Categoria, Valor]) => ({ Categoria, Valor: String(Valor) }));
}

function groupMonth(rows: Response[]): Array<Record<string, string>> {
  const totals = rows.reduce<Map<string, number>>((map, row) => map.set(doneAt(row).slice(0, 7) || "Sem data", (map.get(doneAt(row).slice(0, 7) || "Sem data") ?? 0) + 1), new Map());
  return Array.from(totals, ([Categoria, Valor]) => ({ Categoria, Valor: String(Valor) })).sort((a, b) => a.Categoria.localeCompare(b.Categoria));
}

function groupByHospitalArea(rows: Response[], hospitals: Hospital[], key: "province" | "municipality", label: string): Array<Record<string, string>> {
  const byHospital = new Map(hospitals.map((item) => [item.id, item[key] ?? "Sem valor"]));
  const totals = rows.reduce<Map<string, number>>((map, row) => {
    const area = byHospital.get(row.hospital_id) ?? "Sem valor";
    return map.set(area, (map.get(area) ?? 0) + 1);
  }, new Map());
  return Array.from(totals, ([Categoria, Valor]) => ({ Categoria, [label]: String(Valor) }));
}

function demand(rows: BloodRequestRow[], label: string): Array<Record<string, string>> {
  const totals = rows.reduce<Map<string, number>>((map, row) => map.set(row.blood_type, (map.get(row.blood_type) ?? 0) + Number(row.units_needed ?? 1)), new Map());
  return Array.from(totals, ([Categoria, Valor]) => ({ Categoria, [label]: String(Valor) })).sort((a, b) => Number(Object.values(b)[1]) - Number(Object.values(a)[1]));
}

function shortages(rows: Inventory[]): Array<Record<string, string>> {
  return rows.filter((item) => Number(item.units_available ?? 0) <= Number(item.minimum_threshold ?? item.safe_minimum ?? 0))
    .map((item) => ({ Categoria: item.blood_type, Valor: String(item.units_available ?? 0) }));
}

function activeHospitals(rows: BloodRequestRow[]) {
  return unique(rows.map((item) => item.hospital_id));
}

function topHospitals(rows: BloodRequestRow[], hospitals: Hospital[]): Array<Record<string, string>> {
  const names = new Map(hospitals.map((item) => [item.id, item.name]));
  return top(rows.map((item) => item.hospital_id)).map((item) => ({ Categoria: names.get(item.id) ?? item.id, Pedidos: String(item.count) }));
}

function topDonors(rows: Response[], donors: Donor[], users: User[]): Array<Record<string, string>> {
  const donorUsers = new Map(donors.map((item) => [item.id, item.user_id]));
  const names = new Map(users.map((item) => [item.id, item.name ?? "Dador"]));
  return top(rows.map((item) => item.donor_id)).map((item) => ({ Categoria: names.get(donorUsers.get(item.id) ?? "") ?? item.id, Doações: String(item.count) }));
}

function top(ids: string[]) {
  const totals = ids.reduce<Map<string, number>>((map, id) => map.set(id, (map.get(id) ?? 0) + 1), new Map());
  return Array.from(totals, ([id, count]) => ({ count, id })).sort((a, b) => b.count - a.count).slice(0, 8);
}

function topBlood(rows: BloodRequestRow[]) {
  return demand(rows, "Pedidos")[0]?.Categoria ?? "Sem dados";
}

function averageFulfillment(requests: BloodRequestRow[], completed: Response[]) {
  if (!completed.length || !requests.length) return "Sem dados";
  return `${Math.round(completed.length / Math.max(requests.length, 1) * 100)}%`;
}

function acceptanceRate(rows: Response[]) {
  return rate(rows.filter((item) => item.status !== "Cancelado").length, rows.length);
}

function reliability(donors: Donor[]): Array<Record<string, string>> {
  const buckets = donors.map((item) => Number(item.reliability_score ?? 75) >= 85 ? "Excelente" : Number(item.reliability_score ?? 75) >= 70 ? "Boa" : Number(item.reliability_score ?? 75) >= 50 ? "Média" : "Baixa");
  return group(buckets.map((Categoria) => ({ Categoria })), "Categoria");
}

function rate(value: number, total: number) {
  return total ? `${Math.round((value / total) * 100)}%` : "0%";
}

function sum(values: number[]) {
  return values.reduce((total, item) => total + item, 0);
}

function doneAt(row: Response) {
  return row.completed_at ?? row.donation_completed_at ?? row.created_at;
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((item): item is string => Boolean(item)))).sort();
}
