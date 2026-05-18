import { registerPushToken, type PushTokenRecord } from "@doe-sangue-angola/shared-services";

declare const process: {
  env: Record<string, string | undefined>;
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export async function registerTokenWithBackend(record: PushTokenRecord) {
  if (!apiUrl) return registerPushToken(record);

  try {
    const response = await fetch(`${apiUrl}/api/push/register`, {
      body: JSON.stringify(record),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) throw new Error("Falha ao registar token push.");
    return response.json();
  } catch {
    return registerPushToken(record);
  }
}
