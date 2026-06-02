import { getStartupHealth } from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type CountFilter = {
  column?: string;
  inValues?: string[];
  value?: string | boolean;
};

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [hospitals, donors, open, completed, failed, health] = await Promise.all([
      countRows(db, "hospitals", { column: "verified", value: true }),
      countRows(db, "donors"),
      countRows(db, "blood_requests", {
        column: "status",
        inValues: ["Aberto", "Em Correspondência", "Agendado", "Doador a Caminho"]
      }),
      countRows(db, "donor_responses", { column: "status", value: "Doação concluída" }),
      countRows(db, "support_issues", {
        column: "status",
        inValues: ["Aberto", "Em revisão"]
      }),
      getStartupHealth()
    ]);

    return {
      completedDonations: completed,
      failedActions: failed,
      openRequests: open,
      pilotDonors: donors,
      pilotHospitals: hospitals,
      systemHealth: Object.values(health).every((status) => status === "operational")
        ? "Operacional"
        : "Atenção necessária"
    };
  });
}

async function countRows(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: string,
  filter?: CountFilter
) {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (filter?.column && filter.inValues) query = query.in(filter.column, filter.inValues);
  if (filter?.column && filter.value !== undefined) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) throw new Error(`${table} count: ${error.message}`);
  return count ?? 0;
}
