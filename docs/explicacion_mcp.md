# 🔌 MCP Server — Explicación completa

Este documento explica qué es el MCP, para qué sirve en este proyecto, cómo funciona por dentro y cómo se conecta con n8n. El código está en `mcp-server/`.

---

## ¿Qué es MCP?

**MCP (Model Context Protocol)** es un protocolo creado por Anthropic que permite a un agente de inteligencia artificial **llamar funciones del mundo real** de forma estructurada.

En términos simples: es la forma en que el AI Agent de n8n puede hacer cosas concretas como consultar una API externa, sin que esa tarea esté hardcodeada dentro del workflow.

---

## ¿Para qué sirve en este proyecto?

El MCP Server tiene **una sola responsabilidad**: consultar el clima de una ciudad y devolver los datos al AI Agent.

El guardado en PostgreSQL **no es parte del MCP** — eso lo hace n8n directamente con su nodo `Insert rows in a table`, que tiene sus propias credenciales de PostgreSQL (`proyecto_clima`).

| Tarea | Quién la hace |
|---|---|
| Consultar el clima | **MCP Server** → tool `get_weather` |
| Generar mensaje final | **AI Agent** (Groq llama-3.1-8b) |
| Guardar en PostgreSQL | **n8n** → nodo `Insert rows in a table` |

---

## La tool del MCP Server

### `get_weather`

**Archivo:** `mcp-server/src/tools/getWeather.js`

El AI Agent la llama así:
```
get_weather({ city: "Bogotá" })
```

Por dentro hace **3 pasos en secuencia**:

```
Paso 1 — Geocodificación
  GET https://api.openweathermap.org/geo/1.0/direct?q=Bogotá
  Resultado: { lat: 4.71, lon: -74.07, name: "Bogotá", country: "CO" }

         ▼

Paso 2 — Datos climáticos
  GET https://api.openweathermap.org/data/2.5/weather?lat=4.71&lon=-74.07&units=metric&lang=es
  Resultado: temperatura, sensación térmica, condición, descripción, humedad, viento

         ▼

Paso 3 — Recomendación base
  Aplica reglas según condición y sensación térmica:
  - Rain / Drizzle / Thunderstorm → "Usa chaqueta impermeable y lleva paraguas."
  - Haze / Mist / Fog             → "Usa chaqueta ligera; hay poca visibilidad."
  - feelsLike ≤ 10°C              → "Usa abrigo."
  - feelsLike ≤ 18°C              → "Usa chaqueta ligera o suéter."
  - feelsLike > 18°C              → "Usa ropa fresca."
```

**Lo que devuelve al AI Agent:**
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

Con estos datos el AI Agent genera el mensaje final humanizado usando Groq. Luego **n8n se encarga de guardar** ese resultado en PostgreSQL por su cuenta.

---

## Cómo se conecta el MCP Server con n8n

La conexión usa el protocolo **SSE (Server-Sent Events)** — una conexión HTTP permanente donde el servidor puede enviarle mensajes al cliente en cualquier momento.

### El proceso de conexión paso a paso

```
n8n (nodo MCP Client)                    MCP Server :3100
        │                                       │
        │── 1. GET /sse ────────────────────────►│
        │                                       │  abre canal permanente
        │◄──────────────── conexión abierta ────│
        │                                       │
        │── 2. ¿Qué tools tenés? ──────────────►│
        │◄──── [ get_weather ] ─────────────────│  n8n descubre la tool
        │                                       │
        │── 3. POST /messages ─────────────────►│
        │   { tool: "get_weather",              │
        │     args: { city: "Bogotá" } }        │
        │                                       │  ejecuta getWeather()
        │◄──── resultado JSON ──────────────────│
```

### Las tres rutas del servidor

| Ruta | Método | Para qué sirve |
|---|---|---|
| `/sse` | GET | n8n se conecta aquí — abre el canal permanente |
| `/messages` | POST | n8n invoca tools y recibe resultados |
| `/health` | GET | Verificar que el servidor esté corriendo |

---

## Estructura interna del MCP Server

```
mcp-server/
├── src/
│   ├── server.js          ← Punto de entrada. Crea el McpServer,
│   │                         registra get_weather, levanta el HTTP con SSE.
│   └── tools/
│       └── getWeather.js  ← Lógica de consulta a OpenWeatherMap
├── package.json           ← Dependencias: @modelcontextprotocol/sdk, node-fetch, dotenv
└── .env                   ← OPENWEATHER_API_KEY, MCP_PORT
```

### Las tres piezas clave de `server.js`

**1. El McpServer — el cerebro del protocolo**
```javascript
const server = new McpServer({
  name: 'climatizacion-mcp',
  version: '1.0.0',
});
```
Maneja todo el protocolo MCP: serializa mensajes, descubre tools, gestiona sesiones.

**2. El registro de la tool — lo que n8n puede llamar**
```javascript
server.tool('get_weather', descripción, { city: z.string() }, handler);
```
Le dice al McpServer: "esta función existe y tiene este parámetro".

**3. El SSEServerTransport — el canal de comunicación**
```javascript
const transport = new SSEServerTransport('/messages', res);
await server.connect(transport);
```
Conecta el McpServer con n8n a través de la conexión SSE abierta.

---

## Variables de entorno necesarias

| Variable | Para qué | Ejemplo |
|---|---|---|
| `OPENWEATHER_API_KEY` | Autenticar llamadas a OpenWeatherMap | `325e18d1...` |
| `MCP_PORT` | Puerto donde corre el MCP Server | `3100` |

> `BACKEND_URL` ya no es necesaria — el MCP Server no llama al backend.

---

## Flujo completo con MCP integrado

```
FRONTEND
  │ GET /api/weather/weather-advice?city=Bogotá
  ▼
BACKEND (Spring Boot :8080)
  │ N8nWebhookClient llama al webhook de n8n
  ▼
N8N WEBHOOK
  │ activa el workflow
  ▼
AI AGENT (Groq llama-3.1-8b-instant)
  │
  ├─► invoca get_weather("Bogotá")
  │         │
  │         ▼
  │    MCP SERVER :3100
  │         ├── geocodifica → OpenWeatherMap /geo
  │         ├── obtiene clima → OpenWeatherMap /weather
  │         └── genera recomendación base
  │         │
  │◄────────┘ devuelve datos climáticos
  │
  │   AI Agent genera mensaje final con Groq
  │
  ▼
[Insert rows in a table]  ← n8n guarda directamente en PostgreSQL
  │
  ▼
RESPOND TO WEBHOOK
  │ devuelve resultado al backend
  ▼
BACKEND → FRONTEND muestra la recomendación al usuario
```

---

## ¿Qué pasaría si el MCP Server no existiera?

La consulta a OpenWeatherMap estaría en nodos separados del workflow de n8n:

- `HTTP Request` → geocodificación
- `HTTP Request1` → datos climáticos
- `Code in JavaScript` → recomendación base

Con el MCP Server, **esa lógica está centralizada en un servicio independiente**, más fácil de mantener, probar y modificar sin tocar el workflow de n8n. El guardado siempre ha sido y sigue siendo responsabilidad de n8n.
