import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Fondo animado -->
  <div class="bg-orb orb-1" id="orb1"></div>
  <div class="bg-orb orb-2" id="orb2"></div>
  <div class="bg-orb orb-3" id="orb3"></div>

  <div class="app-wrapper">

    <p class="app-title">El Tiempo</p>

    <!-- Buscador -->
    <div class="search-card">
      <span class="search-icon">🔍</span>
      <input
        id="cityInput"
        class="search-input"
        type="text"
        placeholder="Busca una ciudad…"
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

      <div class="ai-section">
        <div class="ai-avatar">✦</div>
        <div>
          <p class="ai-label">Recomendación IA</p>
          <p class="ai-text" id="wRecommendation"></p>
        </div>
      </div>

    </div>

  </div>
`

// ── Configuración ──────────────────────────────────────────
const BACKEND_URL = 'http://localhost:8080/api/weather'

// ── Tipos ──────────────────────────────────────────────────
interface WeatherResponse {
  id: number
  city: string
  country: string
  temperature: number
  weatherCondition: string
  recommendedClothes: string
}

// ── Referencias al DOM ─────────────────────────────────────
const cityInput   = document.getElementById('cityInput')   as HTMLInputElement
const searchBtn   = document.getElementById('searchBtn')   as HTMLButtonElement
const loadingCard = document.getElementById('loadingCard') as HTMLElement
const errorCard   = document.getElementById('errorCard')   as HTMLElement
const errorText   = document.getElementById('errorText')   as HTMLElement
const weatherCard = document.getElementById('weatherCard') as HTMLElement

// ── Helpers de UI ──────────────────────────────────────────
function setLoading(active: boolean): void {
  loadingCard.classList.toggle('visible', active)
  searchBtn.disabled = active
}

function setError(msg: string): void {
  errorText.textContent = msg
  errorCard.classList.add('visible')
}

function clearError(): void {
  errorCard.classList.remove('visible')
}

// ── Render de datos ────────────────────────────────────────
function showWeather(data: WeatherResponse): void {
  document.getElementById('wCity')!.textContent           = data.city
  document.getElementById('wCountry')!.textContent        = data.country
  document.getElementById('wTemp')!.textContent           = Math.round(data.temperature).toString()
  document.getElementById('wDesc')!.textContent           = data.weatherCondition
  document.getElementById('wRecommendation')!.textContent = data.recommendedClothes

  // Mostrar tarjeta con animación
  weatherCard.classList.remove('visible')
  void weatherCard.offsetWidth
  weatherCard.classList.add('visible')
}

// ── Fetch al backend ───────────────────────────────────────
async function fetchWeather(): Promise<void> {
  const city = cityInput.value.trim()
  if (!city) {
    cityInput.focus()
    return
  }

  clearError()
  weatherCard.classList.remove('visible')
  setLoading(true)

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city })
    })

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

    const data: WeatherResponse = await res.json()
    showWeather(data)

  } catch (e: any) {
    setError(e.message || 'No se pudo conectar con el servidor.')
  } finally {
    setLoading(false)
  }
}

// ── Eventos ────────────────────────────────────────────────
searchBtn.addEventListener('click', fetchWeather)
cityInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') fetchWeather()
})