import type { UserRole } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { mapUser, type UserRow } from "./databaseTypes";

const authUserColumns = [
  "id",
  "auth_user_id",
  "role",
  "linked_entity_id",
  "name",
  "email",
  "phone",
  "created_at"
].join(",");

const legacyUserColumns = [
  "id",
  "auth_user_id",
  "role",
  "name",
  "email",
  "phone",
  "created_at"
].join(",");

export const authRepository = {
  async findProfileByAuthUser(authUserId: string, email?: string) {
    const query = email
      ? `auth_user_id.eq.${authUserId},email.eq.${email}`
      : `auth_user_id.eq.${authUserId}`;
    const db = getDatabaseClient();
    const { data, error } = await db
      .from("profiles")
      .select(authUserColumns)
      .or(query)
      .maybeSingle();

    if (error) throw error;
    if (data) return mapUser(data as unknown as UserRow);

    const { data: legacy, error: legacyError } = await db
      .from("users")
      .select(legacyUserColumns)
      .or(query)
      .maybeSingle();

    if (legacyError) throw legacyError;
    return legacy ? mapUser(legacy as unknown as UserRow) : undefined;
  },

  async upsertProfile(input: {
    authUserId: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    linkedEntityId?: string;
  }) {
    const db = getDatabaseClient();
    const { data, error } = await db
      .from("profiles")
      .upsert({
        auth_user_id: input.authUserId,
        email: input.email,
        linked_entity_id: input.linkedEntityId,
        name: input.name,
        phone: input.phone,
        role: input.role
      }, { onConflict: "email" })
      .select(legacyUserColumns)
      .single();

    if (error) throw error;
    const profile = data as unknown as UserRow;
    const { data: user, error: userError } = await db
      .from("users")
      .upsert({
        id: profile.id,
        auth_user_id: input.authUserId,
        email: input.email,
        name: input.name,
        phone: input.phone,
        role: input.role
      }, { onConflict: "email" })
      .select(legacyUserColumns)
      .single();

    if (userError) throw userError;
    return mapUser(user as unknown as UserRow);
  }
};
