/**
 * Гаверсинус формула для розрахунку відстані між двома точками на Землі
 * @param lat1 широта першої точки (градуси)
 * @param lon1 довгота першої точки (градуси)
 * @param lat2 широта другої точки (градуси)
 * @param lon2 довгота другої точки (градуси)
 * @returns відстань у кілометрах
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радіус Землі в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
