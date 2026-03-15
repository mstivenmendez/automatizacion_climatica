import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Fondo animado -->
  <div class="bg-orb orb-1" id="orb1"></div>
  <div class="bg-orb orb-2" id="orb2"></div>
  <div class="bg-orb orb-3" id="orb3"></div>

  <div class="app-wrapper">

    <p class="app-title">Weather App</p>

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

    <!-- NUEVO: Historial reciente -->
    <div class="weather-card visible" style="margin-top: 16px;">
      <div class="city-row">
        <span class="city-name">Últimas consultas</span>
        <span class="country-badge">/recent</span>
      </div>

      <div id="recentList" style="margin-top: 12px;"></div>

      <div class="divider"></div>

      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="search-btn" id="recentPrevBtn">Anterior</button>
        <button class="search-btn" id="recentNextBtn">Siguiente</button>
      </div>

      <p class="query-time" id="recentPageInfo"></p>
    </div>

  </div>
`

// ── Configuración ──────────────────────────────────────────
// Ajusta si tu controller usa otra ruta (ej: /api/weather-advice)
const BACKEND_URL = 'http://localhost:8080/api/weather/weather-advice'
const RECENT_URL = 'http://localhost:8080/api/weather/recent'
const PAGE_SIZE = 5
let recentPage = 1

// ── Tipos ──────────────────────────────────────────────────
interface N8nWeatherItem {
  id: number
  city: string
  country: string
  temperature: string | number
  weather_condition: string
  recommended_clothes: string
  created_at: string
}

type RecentItem = {
  city?: string
  country?: string
  temperature?: string | number
  weatherCondition?: string
  weather_condition?: string
  recommendedClothes?: string
  recommended_clothes?: string
  createdAt?: string
  created_at?: string
}

// ── Referencias al DOM ─────────────────────────────────────
const cityInput   = document.getElementById('cityInput')   as HTMLInputElement
const searchBtn   = document.getElementById('searchBtn')   as HTMLButtonElement
const loadingCard = document.getElementById('loadingCard') as HTMLElement
const errorCard   = document.getElementById('errorCard')   as HTMLElement
const errorText   = document.getElementById('errorText')   as HTMLElement
const weatherCard = document.getElementById('weatherCard') as HTMLElement

// ocultar secciones que NO vienen en el response actual
const statsRow = weatherCard.querySelector('.stats-row') as HTMLElement | null

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

// ── Helpers ────────────────────────────────────────────────
function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function alertIcon(alert: string): string {
  if (alert.includes('abrigo') || alert.includes('bufanda')) return '🧥'
  if (alert.includes('chaqueta') || alert.includes('suéter') || alert.includes('cortavientos')) return '🧣'
  if (alert.includes('ligera') || alert.includes('calor')) return '👕'
  if (alert.includes('paraguas') || alert.includes('impermeable')) return '☂️'
  if (alert.includes('viento')) return '🌬️'
  return '📌'
}

// ── Render de datos ────────────────────────────────────────
function showWeather(data: N8nWeatherItem): void {
  const temp = Number(data.temperature)
  const tempText = Number.isFinite(temp) ? temp.toFixed(2) : '-'

  document.getElementById('wCity')!.textContent           = data.city ?? '-'
  document.getElementById('wCountry')!.textContent        = data.country ?? '-'
  document.getElementById('wTemp')!.textContent           = tempText
  document.getElementById('wDesc')!.textContent           = data.weather_condition ?? '-'
  document.getElementById('wRecommendation')!.textContent = data.recommended_clothes ?? '-'
  document.getElementById('wTime')!.textContent           = `Fecha: ${formatDate(data.created_at)}`

  // ocultar campos no presentes en el JSON actual
  if (statsRow) statsRow.style.display = 'none'

  const alertsSection = document.getElementById('alertsSection')!
  alertsSection.style.display = 'none'

  weatherCard.classList.remove('visible')
  void weatherCard.offsetWidth
  weatherCard.classList.add('visible')
}

// ── Fetch al backend ───────────────────────────────────────
async function fetchWeather(): Promise<void> {
  const city = normalizeCity(cityInput.value)
  if (!city) {
    cityInput.focus()
    return
  }

  clearError()
  weatherCard.classList.remove('visible')
  setLoading(true)

  try {
    const url = `${BACKEND_URL}?city=${encodeURIComponent(city)}`
    const res = await fetch(url, { method: 'GET' })

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

    const data: N8nWeatherItem[] = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Sin datos para la ciudad consultada.')
    }

    showWeather(data[0])
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'No se pudo conectar con el servidor.'
    setError(msg)
  } finally {
    setLoading(false)
  }
}

// ── Eventos ────────────────────────────────────────────────
searchBtn.addEventListener('click', fetchWeather)
cityInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') fetchWeather()
})

function normalizeCity(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

function pickCondition(item: RecentItem): string {
  return item.weatherCondition ?? item.weather_condition ?? '-'
}

function pickRecommendation(item: RecentItem): string {
  return item.recommendedClothes ?? item.recommended_clothes ?? '-'
}

function pickCreatedAt(item: RecentItem): string {
  return item.createdAt ?? item.created_at ?? ''
}

function renderRecent(items: RecentItem[]): void {
  const listEl = document.getElementById('recentList') as HTMLElement
  const infoEl = document.getElementById('recentPageInfo') as HTMLElement

  if (!items.length) {
    listEl.innerHTML = '<p class="weather-desc">No hay consultas recientes.</p>'
    infoEl.textContent = `Página ${recentPage}`
    return
  }

  listEl.innerHTML = items.map((r) => `
    <article style="padding:10px; border:1px solid rgba(255,255,255,.15); border-radius:10px; margin-bottom:8px;">
      <div class="city-row">
        <span class="city-name">${r.city ?? '-'}</span>
        <span class="country-badge">${r.country ?? '-'}</span>
      </div>
      <p class="weather-desc">Temp: ${r.temperature ?? '-'} °C · Condición: ${pickCondition(r)}</p>
      <p class="ai-text">${pickRecommendation(r)}</p>
      <p class="query-time">${formatDate(pickCreatedAt(r))}</p>
    </article>
  `).join('')

  infoEl.textContent = `Página ${recentPage} · ${items.length} registros`
}

async function loadRecent(page: number): Promise<void> {
  // Truco con endpoint actual: pedimos page*5 y luego cortamos en cliente
  const limit = page * PAGE_SIZE
  const res = await fetch(`${RECENT_URL}?limit=${limit}`)

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

  const all: RecentItem[] = await res.json()
  const start = (page - 1) * PAGE_SIZE
  const pageItems = all.slice(start, start + PAGE_SIZE)

  renderRecent(pageItems)

  const prevBtn = document.getElementById('recentPrevBtn') as HTMLButtonElement
  const nextBtn = document.getElementById('recentNextBtn') as HTMLButtonElement

  prevBtn.disabled = page <= 1
  // si llegaron menos de "limit", no hay más páginas
  nextBtn.disabled = all.length < limit
}

async function loadRecentSafe(page: number): Promise<void> {
  try {
    await loadRecent(page)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'No se pudo cargar /recent'
    setError(msg)
  }
}

const recentPrevBtn = document.getElementById('recentPrevBtn') as HTMLButtonElement
const recentNextBtn = document.getElementById('recentNextBtn') as HTMLButtonElement

recentPrevBtn.addEventListener('click', async () => {
  if (recentPage <= 1) return
  recentPage--
  await loadRecentSafe(recentPage)
})

recentNextBtn.addEventListener('click', async () => {
  recentPage++
  await loadRecentSafe(recentPage)
})

// carga inicial
void loadRecentSafe(recentPage)