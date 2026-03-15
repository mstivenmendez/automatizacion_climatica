/**
 * Tool: get_weather
 *
 * Replica la lógica de los nodos del workflow de n8n:
 *   1. HTTP Request  → GET /geo/1.0/direct  (geocodificación ciudad → lat/lon)
 *   2. HTTP Request1 → GET /data/2.5/weather (datos climáticos por lat/lon)
 *   3. Code in JavaScript → extrae campos y genera recomendación base
 *
 * Esta recomendación base luego es enriquecida por el AI Agent (Groq) en n8n.
 */

import fetch from 'node-fetch';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Geocodifica una ciudad al primer resultado de lat/lon.
 * @param {string} city
 * @returns {Promise<{lat: number, lon: number, name: string, country: string}>}
 */
async function geocodeCity(city) {
  const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
  url.searchParams.set('q', city);
  url.searchParams.set('appid', OPENWEATHER_API_KEY);
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Geocoding error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error(`Ciudad no encontrada: "${city}"`);
  }

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
    country: data[0].country,
  };
}

/**
 * Obtiene datos climáticos actuales para lat/lon.
 * Igual que el nodo HTTP Request1 del workflow (units=metric, lang=es).
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} Respuesta cruda de OpenWeatherMap /data/2.5/weather
 */
async function fetchWeatherData(lat, lon) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('appid', OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', 'es');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Lógica de recomendación base — igual al nodo "Code in JavaScript" del workflow.
 * @param {string} condition  Ej: "Rain", "Haze", "Clear"
 * @param {number} feelsLike  Temperatura de sensación térmica en °C
 * @returns {string}
 */
function buildRecommendation(condition, feelsLike) {
  if (
    condition === 'Rain' ||
    condition === 'Drizzle' ||
    condition === 'Thunderstorm'
  ) {
    return 'Usa chaqueta impermeable y lleva paraguas.';
  }
  if (
    condition === 'Haze' ||
    condition === 'Mist' ||
    condition === 'Fog'
  ) {
    return 'Usa chaqueta ligera; hay poca visibilidad por niebla o bruma.';
  }
  if (feelsLike <= 10) return 'Usa abrigo.';
  if (feelsLike <= 18) return 'Usa chaqueta ligera o suéter.';
  return 'Usa ropa fresca.';
}

/**
 * Ejecuta la tool get_weather completa.
 * @param {string} city  Nombre de la ciudad ingresada por el usuario
 * @returns {Promise<object>} Datos climáticos + recomendación base
 */
export async function getWeather(city) {
  if (!city || city.trim() === '') {
    throw new Error('El parámetro "city" es requerido.');
  }

  // Paso 1 — Geocodificación (equivale al nodo HTTP Request del workflow)
  const geo = await geocodeCity(city.trim());

  // Paso 2 — Datos climáticos (equivale al nodo HTTP Request1 del workflow)
  const weather = await fetchWeatherData(geo.lat, geo.lon);

  // Paso 3 — Extracción y recomendación (equivale al nodo Code in JavaScript)
  const temp      = weather.main.temp;
  const feelsLike = weather.main.feels_like;
  const condition = weather.weather[0].main;
  const description = weather.weather[0].description;
  const humidity  = weather.main.humidity;
  const windSpeed = weather.wind.speed;
  const country   = weather.sys?.country ?? geo.country ?? null;

  const recommendation = buildRecommendation(condition, feelsLike);

  return {
    city: geo.name,
    country,
    temp,
    feelsLike,
    condition,
    description,
    humidity,
    windSpeed,
    recommendation,
  };
}
