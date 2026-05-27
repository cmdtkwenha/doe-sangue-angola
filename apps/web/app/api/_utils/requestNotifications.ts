import { matchingAgent } from "@doe-sangue-angola/agents";
import { mapDonor, type DonorRow } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import type { createRouteSupabase } from "./security";
import { notifyAdmins, notifyUser } from "./notifications";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function notifyMatchedDonors(
  db: Db,
  requestRecord: BloodRequest,
  donorColumns: string
) {
  const disaster = requestRecord.urgency === "Desastre";
  const query = db.from("donors").select(donorColumns);
  const { data } = disaster
    ? await query
    : await query.eq("province", requestRecord.province);
  const donors = (data as unknown as DonorRow[] | null ?? []).map(mapDonor);
  const matches = matchingAgent(requestRecord, donors).filter((item) => item.score >= (disaster ? 45 : 55));
  await Promise.all(matches.map((match) =>
    notifyUser(db, {
      message: `${disaster ? "Emergência nacional" : "Pedido"} ${requestRecord.bloodType} perto de si. ${requestRecord.units} bolsas necessárias.`,
      publicUserId: match.donor.userId,
      role: "donor",
      title: "Pedido urgente perto de si",
      type: disaster || requestRecord.urgency === "Critica" ? "urgent" : "request"
    })
  ));
  if (matches.length === 0) {
    await notifyAdmins(db, "Sem dadores compatíveis", `Pedido ${requestRecord.id} não encontrou dadores imediatos.`, "matching");
  }
}
