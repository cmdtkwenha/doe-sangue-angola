import type { UserRole } from "@doe-sangue-angola/shared-types";
import type { createRouteSupabase } from "./security";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function notifyUser(
  db: Db,
  input: {
    authUserId?: string | null;
    message: string;
    publicUserId?: string | null;
    role: UserRole;
    title: string;
    type: string;
  }
) {
  const userId = input.publicUserId ?? await publicUserIdForAuth(db, input.authUserId);
  if (!userId) return;
  await db.from("notifications").insert({
    body: input.message,
    message: input.message,
    role: input.role,
    title: input.title,
    type: input.type,
    user_id: userId
  });
}

export async function notifyAdmins(db: Db, title: string, message: string, type = "platform") {
  const { data } = await db
    .from("profiles")
    .select("auth_user_id")
    .eq("role", "admin");
  await Promise.all((data ?? []).map((profile) =>
    notifyUser(db, {
      authUserId: profile.auth_user_id,
      message,
      role: "admin",
      title,
      type
    })
  ));
}

export async function notifyHospitalUsers(
  db: Db,
  hospitalId: string,
  title: string,
  message: string,
  type = "workflow"
) {
  const { data } = await db
    .from("profiles")
    .select("auth_user_id")
    .eq("role", "hospital")
    .eq("linked_entity_id", hospitalId);
  await Promise.all((data ?? []).map((profile) =>
    notifyUser(db, {
      authUserId: profile.auth_user_id,
      message,
      role: "hospital",
      title,
      type
    })
  ));
}

async function publicUserIdForAuth(db: Db, authUserId?: string | null) {
  if (!authUserId) return "";
  const { data } = await db
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data?.id ?? "";
}
