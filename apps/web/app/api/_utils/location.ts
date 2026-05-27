export type Coordinates = {
  latitude?: number | null;
  longitude?: number | null;
};

export function hasCoordinates(value?: Coordinates | null) {
  return Number.isFinite(value?.latitude) && Number.isFinite(value?.longitude);
}

export function distanceKm(from?: Coordinates | null, to?: Coordinates | null) {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return undefined;
  const radius = 6371;
  const lat1 = toRadians(from?.latitude ?? 0);
  const lat2 = toRadians(to?.latitude ?? 0);
  const deltaLat = toRadians((to?.latitude ?? 0) - (from?.latitude ?? 0));
  const deltaLng = toRadians((to?.longitude ?? 0) - (from?.longitude ?? 0));
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function etaMinutes(distance?: number) {
  if (!Number.isFinite(distance)) return undefined;
  return Math.max(8, Math.round((distance ?? 0) / 22 * 60));
}

function toRadians(value: number) {
  return value * Math.PI / 180;
}
