# MCP Server — Asistente Climático

Servidor MCP (Model Context Protocol) que expone una herramienta estructurada para el **AI Agent de n8n**: consultar el clima de una ciudad mediante OpenWeatherMap.

> El guardado en PostgreSQL **no es responsabilidad del MCP Server** — lo hace n8n directamente con su propio nodo `Insert rows in a table` (credencial `proyecto_clima`).

---

## ¿Qué hace?

| Tool | Qué hace |
|---|---|
| `get_weather` | Geocodifica la ciudad, obtiene datos climáticos y genera recomendación base de vestimenta |

---

## Instalación

```bash
cd mcp-server
npm install
cp .env.example .env    # editar con tu API key
```

Editar `.env`:

```env
OPENWEATHER_API_KEY=tu_clave_aqui
MCP_PORT=3100
```

---

## Ejecución

```bash
# Producción
npm start

# Desarrollo (recarga automática)
npm run dev
```

Salida esperada al arrancar:

```
🌤️  MCP Server — Asistente Climático
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀  Corriendo en:   http://localhost:3100
🔗  SSE endpoint:   http://localhost:3100/sse
💬  Messages:       http://localhost:3100/messages
❤️   Health check:   http://localhost:3100/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️   Tool expuesta: get_weather
```

---

## Tool: `get_weather`

El AI Agent la invoca así:
```
get_weather({ city: "Bogotá" })
```

Por dentro ejecuta 3 pasos:

```
Paso 1 — Geocodificación
  GET /geo/1.0/direct?q=Bogotá
  → { lat: 4.71, lon: -74.07, name: "Bogotá", country: "CO" }

Paso 2 — Datos climáticos
  GET /data/2.5/weather?lat=4.71&lon=-74.07&units=metric&lang=es
  → temperatura, sensación térmica, condición, humedad, viento

Paso 3 — Recomendación base (por reglas)
  Rain / Drizzle / Thunderstorm → "Usa chaqueta impermeable y lleva paraguas."
  Haze / Mist / Fog             → "Usa chaqueta ligera; hay poca visibilidad."
  feelsLike ≤ 10°C              → "Usa abrigo."
  feelsLike ≤ 18°C              → "Usa chaqueta ligera o suéter."
  feelsLike > 18°C              → "Usa ropa fresca."
```

Respuesta que recibe el AI Agent:

```json
{
  "city": "Bogotá",
  "country": "CO",
  "temp": 14.5,
  "feelsLike": 13.2,
  "condition": "Clouds",
  "description": "muy nuboso",
  "humidity": 82,
  "windSpeed": 3.1,
  "recommendation": "Usa chaqueta ligera o suéter."
}
```

El AI Agent usa estos datos para generar el mensaje final con Groq. Después, **n8n guarda el resultado en PostgreSQL** con el nodo `Insert rows in a table`.

---

## Configuración en n8n

### Paso 1 — Crear la credencial MCP Client

1. En n8n → **Credentials → New → MCP Client**
2. **SSE URL:** `http://localhost:3100/sse`
3. Guardar como `climatizacion-mcp`

### Paso 2 — Conectar al AI Agent

1. Abrir el nodo **AI Agent** del workflow
2. **Tools → Add Tool → MCP Client**
3. Seleccionar `climatizacion-mcp`
4. n8n descubrirá automáticamente la tool `get_weather`

### Paso 3 — Prompt del AI Agent

```
Eres un asistente de clima y vestimenta.

Cuando el usuario pregunte por el clima de una ciudad:
1. Usa la tool get_weather para obtener los datos climáticos.
2. Con los datos obtenidos, genera un mensaje corto, amable y claro (máximo 2 oraciones).

Reglas para el mensaje:
- Máximo 2 oraciones.
- Usa la temperatura y condición climática para dar contexto.
- Refuerza la recomendación de ropa sin copiarla de forma mecánica.
- No uses saludos largos ni despedidas.
- No uses listas.
- Responde solo con el texto final.
```

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sse` | n8n abre la conexión SSE aquí |
| `POST` | `/messages?sessionId=<id>` | n8n invoca tools y recibe resultados |
| `GET` | `/health` | Verifica que el servidor esté activo |

---

## Estructura

```
mcp-server/
├── package.json           # Dependencias: @modelcontextprotocol/sdk, node-fetch, dotenv
├── .env.example           # Plantilla: OPENWEATHER_API_KEY, MCP_PORT
├── .env                   # Variables locales (no subir a git)
├── .gitignore
└── src/
    ├── server.js          # Servidor MCP principal (SSE transport, registra tools)
    └── tools/
        └── getWeather.js  # Tool get_weather — geocodificación + clima + recomendación
```
