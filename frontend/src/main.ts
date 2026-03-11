import "./style.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("No se encontró el contenedor principal.");
}

appRoot.innerHTML = `
  <!-- Fondo animado -->
  <div class="bg-orb orb-1" id="orb1"></div>
  <div class="bg-orb orb-2" id="orb2"></div>
  <div class="bg-orb orb-3" id="orb3"></div>

  <div class="app-wrapper">

    <p class="app-title">Weather App</p>

    <!-- Buscador -->
    <div class="search-card">
      <span class="search-icon"></span>
      <input
        id="cityInput"
        class="search-input"
        type="text"
        placeholder="Consultar ciudad…"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="search-btn" id="searchBtn">Consultar</button>
    </div>

    <!-- Loading -->
    <div class="loading-card" id="loadingCard">
      <div class="loader"></div>
      <p class="loading-text">Consultando el clima…</p>
    </div>

    <!-- Error -->
    <div class="error-card" id="errorCard">
      <span>⚠️</span>
      <p class="error-text" id="errorText"></p>
    </div>

    <!-- Tarjeta del clima -->
    <div class="weather-card" id="weatherCard">

      <div class="city-row">
        <span class="city-name" id="wCity"></span>
        <span class="country-badge" id="wCountry"></span>
      </div>

      <div class="temp-row">
        <span class="temp-value" id="wTemp"></span>
        <span class="temp-unit">°C</span>
      </div>
      <p class="weather-desc" id="wDesc"></p>

      <div class="divider"></div>

      <div class="stats-row">
        <div class="stat-pill">
          <span class="stat-icon">🌡️</span>
          <span class="stat-label">Sensación</span>
          <span class="stat-value" id="wFeels"></span>
        </div>
        <div class="stat-pill">
          <span class="stat-icon">💧</span>
          <span class="stat-label">Humedad</span>
          <span class="stat-value" id="wHumidity"></span>
        </div>
        <div class="stat-pill">
          <span class="stat-icon">💨</span>
          <span class="stat-label">Viento</span>
          <span class="stat-value" id="wWind"></span>
        </div>
      </div>

      <div class="alerts-section" id="alertsSection">
        <p class="section-label">Alertas de vestimenta</p>
        <div class="alerts-list" id="alertsList"></div>
      </div>

      <div class="divider"></div>

      <div class="ai-section">
        <div class="ai-avatar">✦</div>
        <div>
          <p class="ai-label">Recomendación IA</p>
          <p class="ai-text" id="wRecommendation"></p>
        </div>
      </div>

      <p class="query-time" id="wTime"></p>
    </div>

  </div>
`;

// ── Configuración ──────────────────────────────────────────
const BACKEND_URL = "http://localhost:8080/api/weather";

// ── Tipos ──────────────────────────────────────────────────
interface WeatherResponse {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  alerts: string[];
  recommendation: string;
  queried_at: string;
}

// ── Referencias al DOM ─────────────────────────────────────
const cityInput = document.getElementById("cityInput") as HTMLInputElement;
const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
const loadingCard = document.getElementById("loadingCard") as HTMLElement;
const errorCard = document.getElementById("errorCard") as HTMLElement;
const errorText = document.getElementById("errorText") as HTMLElement;
const weatherCard = document.getElementById("weatherCard") as HTMLElement;

// ── Helpers de UI ──────────────────────────────────────────
function setLoading(active: boolean): void {
  loadingCard.classList.toggle("visible", active);
  searchBtn.disabled = active;
}

function setError(msg: string): void {
  errorText.textContent = msg;
  errorCard.classList.add("visible");
}

function clearError(): void {
  errorCard.classList.remove("visible");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function alertIcon(alert: string): string {
  if (alert.includes("abrigo") || alert.includes("bufanda")) return "🧥";
  if (
    alert.includes("chaqueta") ||
    alert.includes("suéter") ||
    alert.includes("cortavientos")
  )
    return "🧣";
  if (alert.includes("ligera") || alert.includes("calor")) return "👕";
  if (alert.includes("cómoda")) return "👔";
  if (alert.includes("paraguas") || alert.includes("impermeable")) return "☂️";
  if (alert.includes("viento")) return "🌬️";
  return "📌";
}

// ── Render de datos ────────────────────────────────────────
function showWeather(data: WeatherResponse): void {
  document.getElementById("wCity")!.textContent = data.city;
  document.getElementById("wCountry")!.textContent = data.country;
  document.getElementById("wTemp")!.textContent = Math.round(
    data.temperature,
  ).toString();
  document.getElementById("wFeels")!.textContent =
    `${Math.round(data.feels_like)}°C`;
  document.getElementById("wHumidity")!.textContent = `${data.humidity}%`;
  document.getElementById("wWind")!.textContent = `${data.wind_speed} m/s`;
  document.getElementById("wDesc")!.textContent = data.description;
  document.getElementById("wRecommendation")!.textContent = data.recommendation;
  document.getElementById("wTime")!.textContent =
    `Consultado el ${formatDate(data.queried_at)}`;

  // Chips de alertas
  const alertsList = document.getElementById("alertsList")!;
  const alertsSection = document.getElementById("alertsSection")!;
  alertsList.innerHTML = "";

  if (data.alerts && data.alerts.length > 0) {
    data.alerts.forEach((alert: string) => {
      const chip = document.createElement("div");
      chip.className = "alert-chip";
      chip.innerHTML = `<span>${alertIcon(alert)}</span><span>${alert}</span>`;
      alertsList.appendChild(chip);
    });
    alertsSection.style.display = "block";
  } else {
    alertsSection.style.display = "none";
  }

  // Mostrar tarjeta con animación
  weatherCard.classList.remove("visible");
  void weatherCard.offsetWidth;
  weatherCard.classList.add("visible");
}

// ── Fetch al backend ───────────────────────────────────────
async function fetchWeather(): Promise<void> {
  const city = cityInput.value.trim();
  if (!city) {
    cityInput.focus();
    return;
  }

  clearError();
  weatherCard.classList.remove("visible");
  setLoading(true);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const data: WeatherResponse = await res.json();
    showWeather(data);
  } catch (e: any) {
    setError(e.message || "No se pudo conectar con el servidor.");
  } finally {
    setLoading(false);
  }
}

// ── Eventos ────────────────────────────────────────────────
searchBtn.addEventListener("click", fetchWeather);
cityInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") fetchWeather();
});
