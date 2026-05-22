/**
 * React хук для отримання поточної геолокації користувача з браузера
 * Запитує дозвіл один раз, результат кешується
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * Хук для отримання координат користувача
 * @param autoRequest якщо true, автоматично запитати дозвіл при монтуванні (за замовчуванням false)
 * @returns {latitude, longitude, error, loading, request}
 */
export function useGeolocation(autoRequest = false) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  // Функція запиту дозволу
  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({
        ...prev,
        error: "Браузер не підтримує геолокацію",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Помилка отримання локації";
        if (error.code === 1) {
          errorMessage = "Дозвіл на геолокацію відмовлено";
        } else if (error.code === 2) {
          errorMessage = "Геолокація недоступна";
        } else if (error.code === 3) {
          errorMessage = "Час очікування вичерпано";
        }
        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: false, // Не потребує точної локації
        timeout: 10000, // 10 сек таймаут
        maximumAge: 5 * 60 * 1000, // Кеш 5 хвилин
      }
    );
  }, []);

  // Автоматично запитати при монтуванні, якщо autoRequest = true
  useEffect(() => {
    if (autoRequest) {
      request();
    }
  }, [autoRequest, request]);

  return {
    ...state,
    request,
  };
}
