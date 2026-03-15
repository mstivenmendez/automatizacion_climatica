# ⚙️ Flujo del Workflow de n8n — proyecto_clima

Este documento explica paso a paso qué hace el workflow de n8n, qué nodo hace cada cosa y cómo se conectan entre sí. El archivo del workflow está en `n8n/proyecto_clima.json`.

---

## Resumen visual del flujo completo

```
[Webhook]
    │
    │  recibe: { city: "Bogotá" }
    ▼
[HTTP Request]  →  geocodifica la ciudad  →  obtiene lat/lon
    │
    ▼
[HTTP Request1]  →  consulta el clima con lat/lon  →  obtiene temperatura, condición, etc.
    │
    ▼
[Code in JavaScript]  →  extrae los campos importantes  →  genera recomendación base
    │
    ▼
[AI Agent]  +  [Groq Chat Model]  →  genera mensaje final amable con IA
    │
    ▼
[Insert rows in a table]  →  guarda todo en PostgreSQL
    │
    ▼
[Respond to Webhook]  →  devuelve la respuesta al backend Spring Boot
```

---

## Nodo 1 — Webhook

**Tipo:** `n8n-nodes-base.webhook`  
**ID del webhook:** `9f86d89c-1508-4fd5-97eb-c061ab83b33e`

### ¿Qué hace?
Es la **puerta de entrada** del workflow. Espera una petición HTTP del backend Spring Boot (`N8nWebhookClient`) y la pasa al siguiente nodo.

### ¿Qué recibe?
```
GET https://<ngrok>/webhook/9f86d89c-...?city=Bogotá
```

El backend envía la ciudad como parámetro en la URL. El nodo la expone como:
```json
{ "query": { "city": "Bogotá" } }
```

### ¿Cómo está configurado?
- Modo de respuesta: `responseNode` — no responde inmediatamente, espera a que el nodo `Respond to Webhook` al final lo haga.

---

## Nodo 2 — HTTP Request (geocodificación)

**Tipo:** `n8n-nodes-base.httpRequest`  
**Nombre:** `HTTP Request`

### ¿Qué hace?
Convierte el nombre de la ciudad en coordenadas geográficas (latitud y longitud) usando la API de geocodificación de OpenWeatherMap.

### URL que llama
```
GET https://api.openweathermap.org/geo/1.0/direct
  ?q=Bogotá
  &appid=<API_KEY>
```

### ¿Qué recibe del nodo anterior?
Toma `$json.query.city` del Webhook — es decir, el nombre de la ciudad.

### ¿Qué retorna?
```json
[
  {
    "name": "Bogotá",
    "lat": 4.7109886,
    "lon": -74.072092,
    "country": "CO"
  }
]
```

---

## Nodo 3 — HTTP Request1 (datos climáticos)

**Tipo:** `n8n-nodes-base.httpRequest`  
**Nombre:** `HTTP Request1`

### ¿Qué hace?
Con la latitud y longitud obtenidas en el paso anterior, consulta el clima actual a OpenWeatherMap.

### URL que llama
```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat=4.7109886
  &lon=-74.072092
  &appid=<API_KEY>
  &units=metric
  &lang=es
```

- `units=metric` → temperatura en grados Celsius
- `lang=es` → descripción del clima en español

### ¿Qué retorna?
La respuesta completa de OpenWeatherMap con temperatura, sensación térmica, condición, descripción, humedad, viento, país, etc.

---

## Nodo 4 — Code in JavaScript (procesamiento)

**Tipo:** `n8n-nodes-base.code`  
**Nombre:** `Code in JavaScript`

### ¿Qué hace?
Es el nodo que **extrae y organiza** los datos importantes de la respuesta de OpenWeatherMap, y aplica las **reglas de recomendación base** de vestimenta.

### Campos que extrae
```javascript
const city      = $('Webhook').first().json.body.city ?? $input.first().json.name;
const country   = $json.sys?.country ?? $json.country ?? null;
const temp      = $json.main.temp;
const feelsLike = $json.main.feels_like;
const condition = $json.weather[0].main;      // "Rain", "Clear", "Clouds"...
const description = $json.weather[0].description;  // "lluvia moderada"...
const humidity  = $json.main.humidity;
const windSpeed = $json.wind.speed;
```

### Reglas de recomendación base
```javascript
if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
  recommendation = 'Usa chaqueta impermeable y lleva paraguas.';
} else if (condition === 'Haze' || condition === 'Mist' || condition === 'Fog') {
  recommendation = 'Usa chaqueta ligera; hay poca visibilidad por niebla o bruma.';
} else if (feelsLike <= 10) {
  recommendation = 'Usa abrigo.';
} else if (feelsLike <= 18) {
  recommendation = 'Usa chaqueta ligera o suéter.';
} else {
  recommendation = 'Usa ropa fresca.';
}
```

> La recomendación aquí es **base**. El AI Agent del siguiente nodo la va a enriquecer y humanizar.

### ¿Qué retorna?
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

---

## Nodo 5 — AI Agent + Groq Chat Model (generación con IA)

**Tipo:** `@n8n/n8n-nodes-langchain.agent`  
**Nombre:** `AI Agent`  
**Modelo:** `llama-3.1-8b-instant` vía **Groq**

### ¿Qué hace?
Recibe los datos climáticos del nodo anterior y genera un **mensaje final amable, natural y corto** para el usuario usando inteligencia artificial.

### Prompt que recibe
```
Eres un asistente de clima y vestimenta.

Tu tarea es generar un mensaje corto, amable y claro para el usuario usando estos datos:

- recommended_clothes: {{ $json.recommendation }}   → "Usa chaqueta ligera o suéter."
- temperature: {{ $json.temp }}                     → 14.5
- weather_condition: {{ $json.condition }}          → "Clouds"

Reglas:
- Escribe máximo 2 oraciones.
- El mensaje debe sonar natural y útil.
- Ten en cuenta la temperatura, la condición climática.
- Refuerza la recomendación de ropa sin copiarla de forma mecánica.
- No agregues saludos largos ni despedidas.
- No uses listas.
- No inventes información adicional.
- Responde solo con el texto final.
```

### ¿Qué retorna?
Un texto en el campo `output`, por ejemplo:
```
Con 14°C y cielos muy nublados en Bogotá, lo mejor es llevar una chaqueta ligera 
o suéter para mantenerte cómodo durante el día.
```

### ¿Qué es el Groq Chat Model?
Es el sub-nodo que le da el modelo de lenguaje al AI Agent. Groq es un proveedor de LLMs rápido y gratuito. El modelo `llama-3.1-8b-instant` es ligero y suficiente para este tipo de tareas.

---

## Nodo 6 — Insert rows in a table (persistencia)

**Tipo:** `n8n-nodes-base.postgres`  
**Nombre:** `Insert rows in a table`  
**Credencial:** `proyecto_clima` (PostgreSQL en Neon)

### ¿Qué hace?
Guarda la consulta completa en la base de datos PostgreSQL en la tabla `weather_queries`.

### Campos que inserta

| Campo en BD | Valor | De dónde viene |
|---|---|---|
| `city` | "Bogotá" | `$('Code in JavaScript').item.json.city` |
| `country` | "CO" | `$('Code in JavaScript').item.json.country` |
| `temperature` | 14.5 | `$('Code in JavaScript').item.json.temp` |
| `weather_condition` | "Clouds" | `$('Code in JavaScript').item.json.condition` |
| `recommended_clothes` | "Con 14°C y cielos..." | `$json.output` (salida del AI Agent) |

> Nótese que `recommended_clothes` usa `$json.output` — el texto generado por el AI Agent, no la recomendación base del nodo Code.

---

## Nodo 7 — Respond to Webhook (respuesta final)

**Tipo:** `n8n-nodes-base.respondToWebhook`  
**Nombre:** `Respond to Webhook`

### ¿Qué hace?
Cierra el ciclo respondiendo al `N8nWebhookClient` del backend Spring Boot con **todos los ítems** del flujo.

### ¿Qué responde?
Con `respondWith: allIncomingItems`, devuelve el JSON del nodo anterior (`Insert rows in a table`), que contiene los datos guardados. El backend lo recibe, lo mapea a `N8nWeatherResponseDTO` y lo reenvía al frontend.

---

## Tabla resumen de nodos

| # | Nodo | Tipo | Qué hace |
|---|---|---|---|
| 1 | Webhook | Trigger | Recibe `city` desde el backend |
| 2 | HTTP Request | HTTP | Geocodifica ciudad → lat/lon |
| 3 | HTTP Request1 | HTTP | Obtiene datos climáticos con lat/lon |
| 4 | Code in JavaScript | Código | Extrae campos y genera recomendación base |
| 5 | AI Agent + Groq | IA | Genera mensaje final humanizado |
| 6 | Insert rows in a table | PostgreSQL | Persiste la consulta en la BD |
| 7 | Respond to Webhook | Respuesta | Devuelve el resultado al backend |

---

## Datos que viajan entre nodos

```
Webhook
  └─► city: "Bogotá"

HTTP Request (geocoding)
  └─► lat: 4.71, lon: -74.07, name: "Bogotá", country: "CO"

HTTP Request1 (weather)
  └─► main.temp, main.feels_like, weather[0].main,
      weather[0].description, main.humidity, wind.speed, sys.country

Code in JavaScript
  └─► city, country, temp, feelsLike, condition,
      description, humidity, windSpeed, recommendation (base)

AI Agent
  └─► output: "Con 14°C y cielos nublados, lleva una chaqueta ligera."

Insert rows in a table
  └─► registro confirmado en PostgreSQL

Respond to Webhook
  └─► JSON completo → N8nWebhookClient → Frontend
```
