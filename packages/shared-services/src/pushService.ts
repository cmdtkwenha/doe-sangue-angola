import type { BloodRequest, Donor } from "@doe-sangue-angola/shared-types";
import { getPushMode } from "./config";
import { getDatabaseClient, isDatabaseConfigured } from "./databaseService";
import type { NotificationType } from "./notificationService";
import { donorRepository } from "./repositories/donorRepository";

export type PushCategory =
  | "emergency_request"
  | "reminder"
  | "appointment_reminder"
  | "reward_unlocked"
  | "family_emergency_request";

export type PushPreference = Record<PushCategory, boolean>;

export type PushTokenRecord = {
  donorId: string;
  platform: "ios" | "android" | "web" | "unknown";
  token: string;
};

export type ExpoPushResult = {
  data?:
    | { id?: string; message?: string; status: "error" | "ok" }
    | Array<{ id?: string; message?: string; status: "error" | "ok" }>;
  errors?: Array<{ code?: string; message?: string }>;
};

export const defaultPushPreferences: PushPreference = {
  emergency_request: true,
  reminder: true,
  appointment_reminder: true,
  reward_unlocked: true,
  family_emergency_request: true
};

const tokenStore: PushTokenRecord[] = [];
const preferenceStore = new Map<string, PushPreference>();

export async function registerPushToken(record: PushTokenRecord) {
  if (!isExpoPushToken(record.token)) {
    throw new Error("Token Expo inválido.");
  }

  const donorId = await resolvePushDonorId(record.donorId);
  const normalized = { ...record, donorId };

  if (!isDatabaseConfigured()) {
    tokenStore.unshift(normalized);
    return { ok: true, mode: "memory", record: normalized };
  }

  const { error } = await getDatabaseClient().from("push_tokens").upsert({
    donor_id: normalized.donorId,
    token: normalized.token,
    platform: normalized.platform,
    active: true
  }, { onConflict: "token" });

  if (error) throw error;
  return { ok: true, mode: "supabase", record: normalized };
}

export async function getPushPreferences(donorId: string) {
  if (!isDatabaseConfigured()) {
    return preferenceStore.get(donorId) ?? defaultPushPreferences;
  }

  const { data, error } = await getDatabaseClient()
    .from("notification_preferences")
    .select("preferences")
    .eq("donor_id", donorId)
    .maybeSingle();

  if (error) throw error;
  return (data?.preferences as PushPreference | null) ?? defaultPushPreferences;
}

export async function updatePushPreferences(donorId: string, preferences: PushPreference) {
  preferenceStore.set(donorId, preferences);
  if (!isDatabaseConfigured()) return { ok: true, mode: "memory", preferences };

  const { error } = await getDatabaseClient().from("notification_preferences").upsert({
    donor_id: donorId,
    preferences
  }, { onConflict: "donor_id" });

  if (error) throw error;
  return { ok: true, mode: "supabase", preferences };
}

export async function sendExpoPushNotification(input: {
  body: string;
  category: PushCategory;
  title: string;
  to: string;
  type: NotificationType;
}) {
  if (getPushMode() !== "expo") {
    return { ok: true, mode: "mock-push", to: input.to, title: input.title };
  }
  try {
    // Expo setup: mobile registers an ExpoPushToken, backend posts it here.
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: input.to,
        title: input.title,
        body: input.body,
        data: { category: input.category, type: input.type },
        categoryId: input.category,
        sound: "default"
      })
    });

    const result = await response.json() as ExpoPushResult;
    const data = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
    const failure = data.find((item) => item.status === "error") ?? result.errors?.[0];
    if (!response.ok || failure) {
      return {
        ok: false,
        message: failure?.message ?? "Falha ao enviar push Expo.",
        mode: "expo"
      };
    }

    return { ok: true, mode: "expo", result };
  } catch {
    return {
      ok: false,
      message: "Push Expo indisponível. Notificação in-app mantida.",
      mode: "expo"
    };
  }
}

export async function sendRequestPushes(request: BloodRequest, donors: Donor[]) {
  const allowed = await filterDonorsByPreference(donors);
  const tokens = await listTokensForDonors(allowed.map((donor) => donor.id));

  return Promise.all(tokens.map(async (record) =>
    sendExpoPushNotification({
      to: record.token,
      title: "Pedido urgente de sangue",
      body: `Pedido urgente ${request.bloodType} perto de si.`,
      category: "emergency_request",
      type: "urgent"
    })
  ));
}

function isExpoPushToken(token: string) {
  return /^ExponentPushToken\[[\w-]+\]$|^ExpoPushToken\[[\w-]+\]$/.test(token);
}

async function filterDonorsByPreference(donors: Donor[]) {
  const pairs = await Promise.all(donors.map(async (donor) => ({
    donor,
    preferences: await getPushPreferences(donor.id)
  })));

  return pairs
    .filter((item) => item.preferences.emergency_request)
    .map((item) => item.donor);
}

async function listTokensForDonors(donorIds: string[]) {
  if (donorIds.length === 0) return [];

  if (!isDatabaseConfigured()) {
    return tokenStore.filter((record) => donorIds.includes(record.donorId));
  }

  const { data, error } = await getDatabaseClient()
    .from("push_tokens")
    .select("donor_id,platform,token")
    .in("donor_id", donorIds)
    .eq("active", true);

  if (error) throw error;
  return data.map((row) => ({
    donorId: row.donor_id,
    platform: row.platform,
    token: row.token
  })) as PushTokenRecord[];
}

async function resolvePushDonorId(donorId: string) {
  if (!isDatabaseConfigured() || donorId !== "d1") return donorId;
  const donors = await donorRepository.listDonors();
  return donors[0]?.id ?? donorId;
}
