import { apiResponse, readJson } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../_utils/security";

type PatchBody = { all?: boolean; notificationId?: string };

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const params = new URL(request.url).searchParams;
    const all = params.get("all") === "true" && principal.role === "admin";
    const db = await createRouteSupabase();
    let query = db
      .from("notifications")
      .select("id,user_id,role,title,message,body,type,read,read_at,created_at")
      .order("created_at", { ascending: false })
      .limit(80);
    if (!all) {
      const userId = await publicUserIdForAuth(db, principal.authUserId);
      query = query.eq("user_id", userId || "missing");
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((item) => ({
      createdAt: item.created_at,
      id: item.id,
      message: item.message ?? item.body ?? "",
      read: Boolean(item.read_at ?? item.read),
      readAt: item.read_at,
      role: item.role,
      title: item.title,
      type: item.type,
      userId: item.user_id
    }));
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<PatchBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const db = await createRouteSupabase();
    const userId = await publicUserIdForAuth(db, principal.authUserId);
    const now = new Date().toISOString();
    let query = db.from("notifications").update({ read: true, read_at: now });
    query = body.all ? query.eq("user_id", userId || "missing") : query.eq("id", body.notificationId ?? "");
    if (principal.role !== "admin" || !body.all) query = query.eq("user_id", userId || "missing");
    const { error } = await query;
    if (error) throw error;
    return { readAt: now };
  });
}

async function publicUserIdForAuth(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  authUserId: string
) {
  const { data, error } = await db
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? "";
}
