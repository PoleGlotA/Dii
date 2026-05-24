/**
 * Геокодування адреси в координати за допомогою Nominatim API (OpenStreetMap)
 * Результати кешуються в localStorage для швидкості
 */
 
const CACHE_KEY_PREFIX = "geocode_cache_";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 днів
 
interface CacheEntry {
  lat: number;
  lng: number;
  timestamp: number;
}
 
interface NominatimResult {
  lat: string;
  lon: string;
}
 
// Очищаємо адресу від спецсимволів які ламають геокодування
// Наприклад: "Київ → Чернігів" → "Київ Чернігів"
function cleanAddress(address: string): string {
  return address
    .replace(/→|=>|->|–|—/g, ' ') // стрілки та тире → пробіл
    .replace(/[^\wа-яіїєґА-ЯІЇЄҐa-zA-Z0-9\s,.-]/gu, ' ') // залишаємо тільки безпечні символи
    .replace(/\s+/g, ' ')
    .trim()
}
 
// Беремо тільки перше місто якщо адреса складена через кому
// "Бровари, Київська обл." → "Бровари"
function extractPrimaryCity(address: string): string {
  const cleaned = cleanAddress(address)
  // Якщо є кома — беремо першу частину як основне місто
  const parts = cleaned.split(',')
  return parts[0]?.trim() ?? cleaned
}
 
/**
 * Геокодує адресу в координати широти/довготи
 * @param address адреса (наприклад, "Київ" або "Бровари, Київська обл.")
 * @returns {lat, lng} або null при помилці
 */
export async function geocodeLocation(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }
 
  // Спочатку пробуємо основне місто (перше слово до коми)
  const primaryCity = extractPrimaryCity(address)
  const normalizedAddress = primaryCity.toLowerCase()
  const cacheKey = CACHE_KEY_PREFIX + base64EncodeUnicode(normalizedAddress)
 
  // Перевіримо кеш
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached)
        if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
          return { lat: entry.lat, lng: entry.lng }
        }
        localStorage.removeItem(cacheKey)
      }
    } catch {
      // ігноруємо
    }
  }
 
  try {
    // Формуємо URL через URLSearchParams — гарантує правильне кодування кирилиці
    const params = new URLSearchParams({
      q: normalizedAddress,
      format: 'json',
      limit: '1',
      countrycodes: 'ua',   // ← правильний параметр (не &country=ua)
      'accept-language': 'uk',
    })
 
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'DiiVolunteerApp/1.0 (volunteer platform ukraine)',
        },
      }
    )
 
    if (!response.ok) {
      console.warn(`Nominatim API error: ${response.status} for "${normalizedAddress}"`)
      return null
    }
 
    const data: NominatimResult[] = await response.json()
 
    if (!data || data.length === 0) {
      console.warn(`Nominatim: no results for "${normalizedAddress}"`)
      return null
    }
 
    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
 
    // Кешуємо
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          ...result,
          timestamp: Date.now(),
        }))
      } catch {
        // ігноруємо
      }
    }
 
    return result
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}
 
function base64EncodeUnicode(str: string): string {
  if (typeof TextEncoder !== "undefined") {
    const bytes = new TextEncoder().encode(str)
    let binary = ""
    bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
    return btoa(binary)
  }
  return btoa(unescape(encodeURIComponent(str)))
}
 
/**
 * Пакетне геокодування — з затримкою між запитами
 * щоб не перевантажувати Nominatim (rate limit: 1 req/sec)
 */
export async function geocodeMultiple(
  addresses: string[]
): Promise<({ lat: number; lng: number } | null)[]> {
  const results: ({ lat: number; lng: number } | null)[] = []
  for (const addr of addresses) {
    results.push(await geocodeLocation(addr))
    // Затримка 300мс між запитами (Nominatim вимагає <= 1 req/sec)
    // Пропускаємо якщо є в кеші — там все миттєво
    await new Promise(r => setTimeout(r, 300))
  }
  return results
}