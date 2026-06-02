import type { UserRole } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { mapUser, type UserRow } from "./databaseTypes";

const userColumns = [
  "id",
  "auth_user_id",
  "role",
  "name",
  "email",
  "phone",
  "created_at"
].join(",");

export const userRepository = {
  async listUsers() {
    const { data, error } = await getDatabaseClient()
      .from("users")
      .select(userColumns)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as UserRow[]).map(mapUser);
  },

  async findUser(id: string) {
    const { data, error } = await getDatabaseClient()
      .from("users")
      .select(userColumns)
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapUser(data as unknown as UserRow);
  },

  async findUserByEmail(email: string) {
    const { data, error } = await getDatabaseClient()
      .from("users")
      .select(userColumns)
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return data ? mapUser(data as unknown as UserRow) : undefined;
  },

  async createUser(input: {
    authUserId?: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
  }) {
    const { data, error } = await getDatabaseClient()
      .from("users")
      .insert({
        account_status: "Ativo",
        auth_user_id: input.authUserId,
        email: input.email,
        name: input.name,
        phone: input.phone,
        role: input.role
      })
      .select(userColumns)
      .single();

    if (error) throw error;
    return mapUser(data as unknown as UserRow);
  }
};
