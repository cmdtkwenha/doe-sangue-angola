import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type FraudRow = {
  entity: string;
  flags: string[];
  id: string;
  risk: "Alto" | "Médio" | "Baixo";
  score: number;
  status: string;
};
type DonorRow = {
  bi_number?: string | null;
  birth_date?: string | null;
  emergency_contact_phone?: string | null;
  eligibility_status?: string | null;
  id: string;
  phone?: string | null;
  reliability_score?: number | null;
  user_id?: string | null;
};
type HospitalRow = {
  id: string;
  institutional_email?: string | null;
  license_number?: string | null;
  name?: string | null;
  nif?: string | null;
  phone?: string | null;
  status?: string | null;
  verification_status?: string | null;
};
type ResponseRow = {
  cancelled_at?: string | null;
  donor_id: string;
  status: string;
};
type UserRow = { email?: string | null; id: string; name?: string | null };

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [donors, users, hospitals, responses, saved] = await Promise.all([
      read<DonorRow>(db, "donors", "id,user_id,bi_number,phone,emergency_contact_phone,birth_date,eligibility_status,reliability_score"),
      read<UserRow>(db, "users", "id,name,email"),
      read<HospitalRow>(db, "hospitals", "id,name,license_number,nif,institutional_email,phone,status,verification_status"),
      read<ResponseRow>(db, "donor_responses", "donor_id,status,cancelled_at"),
      readSavedReviews(db)
    ]);
    const userById = new Map(users.map((user) => [user.id, user]));
    const rows = [
      ...duplicateDonors(donors, userById),
      ...duplicateHospitals(hospitals),
      ...suspiciousResponses(donors, responses, userById),
      ...verificationFlags(donors, hospitals, userById),
      ...saved
    ];
    return dedupe(rows).sort((a, b) => b.score - a.score);
  });
}

async function read<T>(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: string,
  columns: string
) {
  const { data, error } = await db.from(table).select(columns);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return (data ?? []) as T[];
}

async function readSavedReviews(db: Awaited<ReturnType<typeof createRouteSupabase>>) {
  const { data, error } = await db
    .from("fraud_reviews")
    .select("id,entity_type,entity_id,risk,status,score,flags,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`fraud_reviews select: ${error.message}`);
  return (data ?? []).map((row) => ({
    entity: `${row.entity_type ?? "Caso"} ${row.entity_id ?? ""}`.trim(),
    flags: row.flags?.length ? row.flags : ["Atividade sinalizada"],
    id: row.id,
    risk: riskLabel(row.risk),
    score: Number(row.score ?? 50),
    status: row.status ?? "Revisão Necessária"
  })) satisfies FraudRow[];
}

function duplicateDonors(donors: DonorRow[], users: Map<string, UserRow>) {
  return [
    ...duplicates("BI", donors, (row) => row.bi_number, (items) => donorCase("BI duplicado", items, users)),
    ...duplicates("Telefone", donors, (row) => row.phone, (items) => donorCase("telefone duplicado", items, users)),
    ...duplicates("Email", donors, (row) => users.get(row.user_id ?? "")?.email, (items) => donorCase("email duplicado", items, users)),
    ...duplicates("Contacto", donors, (row) => row.emergency_contact_phone, (items) => donorCase("contacto de emergência duplicado", items, users)),
    ...duplicates("Nascimento", donors, (row) => row.birth_date, (items) => donorCase("data de nascimento duplicada", items, users))
  ];
}

function duplicateHospitals(hospitals: HospitalRow[]) {
  return [
    ...duplicates("Licença", hospitals, (row) => row.license_number, (items) => hospitalCase("licença duplicada", items)),
    ...duplicates("NIF", hospitals, (row) => row.nif, (items) => hospitalCase("NIF duplicado", items)),
    ...duplicates("Email", hospitals, (row) => row.institutional_email, (items) => hospitalCase("email duplicado", items)),
    ...duplicates("Telefone", hospitals, (row) => row.phone, (items) => hospitalCase("telefone duplicado", items))
  ];
}

function suspiciousResponses(donors: DonorRow[], responses: ResponseRow[], users: Map<string, UserRow>) {
  return donors.flatMap((donor) => {
    const rows = responses.filter((item) => item.donor_id === donor.id);
    const cancelled = rows.filter((item) => item.status === "Cancelado").length;
    const noShows = rows.filter((item) => item.status === "Não Compareceu").length;
    const active = rows.filter((item) => ["Dador a Caminho", "Chegou", "PIN Validado"].includes(item.status)).length;
    if (cancelled < 3 && noShows < 2 && active < 2) return [];
    const reliability = donorReliability(cancelled, noShows, active);
    return [caseRow({
      entity: donorName(donor, users),
      flags: [`Confiabilidade do Dador: ${reliability}`, `${cancelled} cancelamentos`, `${noShows} faltas`, `${active} aceitações ativas`],
      id: `COMPORTAMENTO-${donor.id}`,
      score: noShows >= 2 ? 88 : 68,
      status: reliability === "Suspenso" ? "Suspenso" : "Revisão Necessária"
    })];
  });
}

function verificationFlags(donors: DonorRow[], hospitals: HospitalRow[], users: Map<string, UserRow>) {
  return [
    ...hospitals.filter((item) => !item.license_number).map((item) => caseRow({
      entity: item.name ?? item.id,
      flags: ["documento em falta", "licença sanitária em falta"],
      id: `HOSPITAL-DOC-${item.id}`,
      score: 62,
      status: item.verification_status ?? item.status ?? "Pendente"
    })),
    ...donors.filter((item) => !item.phone || !users.get(item.user_id ?? "")?.email).map((item) => caseRow({
      entity: donorName(item, users),
      flags: ["documento em falta", !item.phone ? "telefone em falta" : "email em falta"],
      id: `DADOR-DOC-${item.id}`,
      score: 52,
      status: item.eligibility_status ?? "Pendente"
    }))
  ];
}

function duplicates<T>(label: string, rows: T[], value: (row: T) => unknown, build: (rows: T[]) => FraudRow[]) {
  const groups = new Map<string, T[]>();
  rows.forEach((row) => {
    const key = clean(value(row));
    if (!key) return;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return Array.from(groups.entries()).flatMap(([key, items]) => items.length > 1 ? build(items).map((row) => ({
    ...row,
    flags: [`Possível duplicação (${label}: ${key})`, ...row.flags]
  })) : []);
}

function donorCase(flag: string, donors: DonorRow[], users: Map<string, UserRow>) {
  return [caseRow({ entity: donors.map((row) => donorName(row, users)).join(" / "), flags: [flag], id: `DADOR-DUP-${donors[0].id}`, score: 76 })];
}

function hospitalCase(flag: string, hospitals: HospitalRow[]) {
  return [caseRow({ entity: hospitals.map((row) => row.name ?? row.id).join(" / "), flags: [flag], id: `HOSPITAL-DUP-${hospitals[0].id}`, score: 82 })];
}

function caseRow(input: Omit<FraudRow, "risk" | "status"> & { risk?: FraudRow["risk"]; status?: string }): FraudRow {
  return { risk: input.risk ?? (input.score >= 80 ? "Alto" : input.score >= 55 ? "Médio" : "Baixo"), status: input.status ?? "Possível duplicação", ...input };
}

function dedupe(rows: FraudRow[]) {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function donorName(donor: DonorRow, users: Map<string, UserRow>) {
  const user = users.get(donor.user_id ?? "");
  return user?.name ?? user?.email ?? donor.id;
}

function donorReliability(cancelled: number, noShows: number, active: number) {
  if (noShows >= 3 || cancelled >= 6) return "Suspenso";
  if (noShows >= 2 || cancelled >= 4) return "Baixa";
  if (cancelled >= 3 || active >= 2) return "Média";
  return "Boa";
}

function riskLabel(value: string | null) {
  if (value === "alto" || value === "Alto") return "Alto";
  if (value === "medio" || value === "Médio") return "Médio";
  return "Baixo";
}
