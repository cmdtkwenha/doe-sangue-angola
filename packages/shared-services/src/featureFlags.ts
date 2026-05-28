export type FeatureFlagKey =
  | "emergencyMode"
  | "featureFreeze"
  | "gamification"
  | "maps"
  | "notifications"
  | "realtime";

export type FeatureFlag = {
  description: string;
  enabled: boolean;
  key: FeatureFlagKey;
  label: string;
};

function readFlag(name: string, fallback: boolean) {
  const snakeName = name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
  const compactName = name.toUpperCase();
  const aliases = name === "featureFreeze"
    ? ["FREEZE", "FEATURE_FREEZE", compactName]
    : [snakeName, compactName];
  const value = aliases
    .flatMap((alias) => [
      process.env[`NEXT_PUBLIC_FEATURE_${alias}`],
      process.env[`EXPO_PUBLIC_FEATURE_${alias}`]
    ])
    .find((item) => item != null);
  if (value == null) return fallback;
  return value === "true";
}

export function getFeatureFlags(): FeatureFlag[] {
  return [
    flag("realtime", "Tempo real", "Atualizações automáticas entre portais.", true),
    flag("notifications", "Notificações", "Alertas in-app e preparação push.", true),
    flag("maps", "Mapas e ETA", "Distância e localização aproximada.", true),
    flag("gamification", "Recompensas", "Pontos, níveis e progresso do dador.", true),
    flag("emergencyMode", "Modo emergência", "Pedidos críticos de maior alcance.", false),
    flag("featureFreeze", "Feature freeze", "Bloqueia mudanças funcionais durante o piloto.", false)
  ];
}

export function isFeatureEnabled(key: FeatureFlagKey) {
  return getFeatureFlags().find((flag) => flag.key === key)?.enabled ?? false;
}

function flag(
  key: FeatureFlagKey,
  label: string,
  description: string,
  fallback: boolean
): FeatureFlag {
  return { description, enabled: readFlag(key, fallback), key, label };
}
