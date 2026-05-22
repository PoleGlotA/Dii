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

/**
 * Геокодує адресу в координати широти/довготи
 * @param address адреса (наприклад, "Київ" або "Вул. Крещатик, Київ")
 * @returns {lat, lng} або null при помилці
 */
export async function geocodeLocation(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  const normalizedAddress = address.trim().toLowerCase();
  const cacheKey = CACHE_KEY_PREFIX + base64EncodeUnicode(normalizedAddress);

  // Перевіримо локальний кеш

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
          return { lat: entry.lat, lng: entry.lng };
        }
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      // Ігноруємо помилки локального сховища
    }
  }

  try {
    // Nominatim API запит
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        normalizedAddress
      )}&country=ua&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "VolunteerApp",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Nominatim API error: ${response.status}`);
      return null;
    }

    const data: NominatimResult[] = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    // Кешуємо результат
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            ...result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ігноруємо помилки при збереженні в кеш
      }
    }

    return result;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

function base64EncodeUnicode(str: string): string {
  if (typeof TextEncoder !== "undefined") {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Пакетне геокодування кількох адрес
 * @param addresses масив адрес
 * @returns масив результатів (у тому ж порядку, null для помилок)
 */
export async function geocodeMultiple(
  addresses: string[]
): Promise<(({ lat: number; lng: number } | null)[] )> {
  return Promise.all(addresses.map((addr) => geocodeLocation(addr)));
}
