import {
  getDonorHome,
  getDonorHomeAsync,
  type DonorHomeSnapshot
} from "@doe-sangue-angola/shared-services";
import { useEffect, useState } from "react";

declare const process: {
  env: Record<string, string | undefined>;
};

export function useMobileStartup(donorId: string) {
  const [home, setHome] = useState<DonorHomeSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        setLoading(true);
        setError(null);
        await checkApiHealth((value) => active && setOffline(value));
        const next = await getDonorHomeAsync(donorId);
        if (active) setHome(next);
      } catch {
        if (active) {
          setError("Não foi possível preparar o app. Tente novamente.");
          setHome(getDonorHome("d1"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void boot();
    return () => {
      active = false;
    };
  }, [donorId, version]);

  return {
    error,
    home,
    loading,
    offline,
    refresh: () => setVersion((item) => item + 1)
  };
}

async function checkApiHealth(setOffline: (offline: boolean) => void) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    setOffline(false);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${apiUrl}/api/health`, {
      signal: controller.signal
    });
    setOffline(!response.ok);
  } catch {
    setOffline(true);
  } finally {
    clearTimeout(timeout);
  }
}
