# 🌤️ Automatización Climática — Asistente de Vestimenta por Clima

> Asistente inteligente que consulta las condiciones climáticas de una ciudad y genera recomendaciones de vestimenta usando **n8n**, **MCP Server**, **Spring Boot**, **PostgreSQL (Neon)** y un frontend **Vite + TypeScript**.

---

## 📋 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Flujo completo del sistema](#-flujo-completo-del-sistema)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [MCP Server](#-mcp-server)
- [Workflow de n8n](#-workflow-de-n8n)
- [Backend — Spring Boot](#-backend--spring-boot)
- [Frontend — Vite + TypeScript](#-frontend--vite--typescript)
- [Base de datos](#-base-de-datos)
- [API REST — Endpoints](#-api-rest--endpoints)
- [Variables de entorno](#-variables-de-entorno)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [Documentación adicional](#-documentación-adicional)
- [Ramas del repositorio](#-ramas-del-repositorio)

---

## 📖 Descripción general

Este proyecto es un **asistente inteligente** que permite consultar el clima de una ciudad y recibir una **recomendación de vestimenta generada por IA**. El usuario escribe el nombre de una ciudad y el sistema responde con la temperatura actual, la condición climática y un mensaje personalizado.

La solución integra cinco componentes que trabajan juntos:

| Componente | Qué hace en el proyecto |
|---|---|
| **Frontend** (Vite + TypeScript) | Interfaz donde el usuario escribe la ciudad y ve la recomendación |
| **Backend** (Spring Boot) | Recibe la petición del frontend y la pasa a n8n |
| **n8n** (AI Agent + Groq) | Orquesta el flujo: activa el MCP, genera el mensaje final con IA y guarda en BD |
| **MCP Server** (Node.js) | Consulta OpenWeatherMap y devuelve los datos climáticos al AI Agent |
| **PostgreSQL** (Neon) | Almacena el historial — guardado directamente por n8n |

---

## 🏗️ Arquitectura del sistema

```
┌─────────────────┐
│    FRONTEND     │  Vite + TypeScript — :5173
│  escribe ciudad │
└────────┬────────┘
         │  GET /api/weather/weather-advice?city=Bogotá
         ▼
┌─────────────────┐
│    BACKEND      │  Spring Boot — :8080
│ N8nWebhookClient│
└────────┬────────┘
         │  GET webhook?city=Bogotá  (via ngrok)
         ▼
┌──────────────────────────────────────────┐
│              n8n WORKFLOW                │
│                                          │
│  Webhook → AI Agent (Groq llama-3.1-8b)  │
│       │                                  │
│       │ invoca tool via SSE              │
│       ▼                                  │
│  MCP Client ──► MCP Server :3100         │──► OpenWeatherMap API
│       │         tool: get_weather        │
│       │                                  │
│       ▼                                  │
│  [Insert rows in a table] ──────────────►│──► PostgreSQL (Neon)
│       │                                  │
│  [Respond to Webhook]                    │
└──────────────────────────────────────────┘
```

### Componentes y puertos

| Componente | Tecnología | Puerto | Rol |
|---|---|---|---|
| Frontend | Vite + TypeScript | 5173 | Interfaz de usuario |
| Backend | Spring Boot 4.x + Java 17 | 8080 | API REST + puente hacia n8n |
| MCP Server | Node.js + MCP SDK | 3100 | Tool `get_weather` para el AI Agent |
| n8n | AI Agent + Groq | ngrok (externo) | Orquestación + guardado en BD |
| Base de datos | PostgreSQL en Neon | 5432 | Persistencia del historial |

---

## 🔄 Flujo completo del sistema

Este es el recorrido exacto de una consulta de principio a fin:

```
1.  Usuario escribe "Bogotá" en el frontend

2.  Frontend → GET /api/weather/weather-advice?city=Bogotá → Backend

3.  Backend (N8nWebhookClient) → GET webhook de n8n?city=Bogotá (via ngrok)

4.  n8n activa el workflow → llega al AI Agent (Groq llama-3.1-8b)

5.  AI Agent invoca tool get_weather("Bogotá") → MCP Server
        ├── geocodifica "Bogotá"    → lat: 4.71, lon: -74.07
        ├── consulta OpenWeatherMap → temp: 14.5°C, condition: "Clouds"
        └── genera recomendación   → "Usa chaqueta ligera o suéter."

6.  AI Agent recibe los datos y genera el mensaje final con Groq:
        "Con 14°C y cielos muy nublados, lo mejor es llevar una chaqueta ligera."

7.  n8n guarda el resultado en PostgreSQL con el nodo "Insert rows in a table"
        city, country, temperature, weather_condition, recommended_clothes → ✓ BD

8.  n8n responde al webhook con el resultado completo

9.  Backend reenvía la respuesta al frontend

10. Frontend muestra ciudad, temperatura, condición y recomendación al usuario
```

---

## 🛠️ Stack tecnológico

### MCP Server
- **Node.js 18+**
- **`@modelcontextprotocol/sdk`** — SDK oficial del protocolo MCP (Anthropic)
- **`node-fetch`** — cliente HTTP para llamadas a OpenWeatherMap
- **`dotenv`** — gestión de variables de entorno
- **Transport:** SSE (Server-Sent Events) — compatible con el nodo MCP Client de n8n

### Backend
- **Java 17** + **Spring Boot 4.0.3**
- Spring Web MVC + Spring Data JPA + Spring Validation (Jakarta)
- **Lombok** — reducción de boilerplate
- **SpringDoc OpenAPI** — Swagger UI automático en `/swagger-ui.html`
- **PostgreSQL** (driver runtime) + H2 (consola de desarrollo)
- **RestTemplate** — cliente HTTP para llamar al webhook de n8n

### Frontend
- **Vite 8.x** (beta) + **TypeScript ~5.9**
- Proxy de desarrollo hacia `http://localhost:8080`

### Infraestructura / IA
- **n8n** — orquestador de flujos (AI Agent nativo + nodo Postgres)
- **Groq** — proveedor de LLM, modelo `llama-3.1-8b-instant`
- **OpenWeatherMap API** — datos meteorológicos en tiempo real
- **PostgreSQL en Neon** — base de datos serverless en la nube
- **ngrok** — túnel público para exponer el webhook de n8n

---

## 📁 Estructura del proyecto

```
automatizacion_climatica/
│
├── .git/                                        # Control de versiones Git
├── .gitattributes
├── .gitignore
│
├── .mvn/                                        # Maven Wrapper config
│   └── wrapper/
│       └── maven-wrapper.properties
│
├── docs/                                        # 📚 Documentación del proyecto
│   ├── README.MD                                # ← Este archivo
│   ├── ProyectoMCP_N8N.md                       # Documento de diseño completo
│   ├── flujo_n8n.md                             # Explicación nodo a nodo del workflow
│   └── explicacion_mcp.md                       # Explicación del MCP Server
│
├── mcp-server/                                  # 🔌 MCP Server (Node.js)
│   ├── package.json                             # Dependencias npm
│   ├── .env.example                             # Plantilla: OPENWEATHER_API_KEY, MCP_PORT
│   ├── .env                                     # Variables locales (no subir a git)
│   ├── .gitignore
│   ├── README.md                                # Documentación del MCP Server
│   └── src/
│       ├── server.js                            # Servidor MCP principal (SSE transport)
│       └── tools/
│           └── getWeather.js                    # Tool get_weather → OpenWeatherMap
│
├── n8n/                                         # ⚙️ Workflow de n8n
│   └── proyecto_clima.json                      # Workflow exportado (importar en n8n)
│
├── frontend/                                    # 🖥️ Frontend (Vite + TypeScript)
│   ├── .env
│   ├── index.html                               # HTML base
│   ├── package.json                             # Scripts: dev | build | preview
│   ├── tsconfig.json
│   ├── vite.config.ts                           # Proxy /api → :8080, puerto 5173
│   └── src/
│       ├── main.ts                              # Lógica principal TypeScript
│       └── style.css                            # Estilos globales
│
├── mvnw                                         # Maven Wrapper (Unix)
├── mvnw.cmd                                     # Maven Wrapper (Windows)
├── pom.xml                                      # Descriptor Maven del backend
│
├── src/                                         # ☕ Backend Spring Boot
│   ├── main/
│   │   ├── java/
│   │   │   └── com/n8n/climatizacion/
│   │   │       ├── ClimatizacionApplication.java
│   │   │       ├── application/
│   │   │       │   ├── dto/
│   │   │       │   │   ├── N8nWeatherRequestDTO.java
│   │   │       │   │   ├── N8nWeatherResponseDTO.java
│   │   │       │   │   ├── WeatherQueryRegistrationRequestDTO.java
│   │   │       │   │   ├── WeatherQueryRequestDTO.java
│   │   │       │   │   └── WeatherQueryResponseDTO.java
│   │   │       │   ├── mapper/
│   │   │       │   │   └── weatherQueryMapper.java
│   │   │       │   └── service/
│   │   │       │       └── WeatherQueryService.java
│   │   │       ├── domain/
│   │   │       │   ├── model/
│   │   │       │   │   └── weatherQuery.java
│   │   │       │   └── util/
│   │   │       │       └── weatherQueryPort.java
│   │   │       └── infrastructure/
│   │   │           ├── adapter/
│   │   │           │   ├── N8nWebhookClient.java      # Llama al webhook de n8n
│   │   │           │   └── weatherQueryAdapter.java
│   │   │           ├── config/
│   │   │           │   ├── CorsConfig.java
│   │   │           │   └── OpenApiConfig.java
│   │   │           ├── controller/
│   │   │           │   └── WeatherQueryController.java
│   │   │           ├── entity/
│   │   │           │   └── weatherQueryEntity.java
│   │   │           └── repository/
│   │   │               └── weatherQueryRepository.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql
│   └── test/
│       └── java/com/n8n/climatizacion/
│           └── ClimatizacionApplicationTests.java
│
└── target/                                      # Compilados Maven (ignorado en git)
```

---

## 🔌 MCP Server

El MCP Server tiene **una sola responsabilidad**: consultar el clima de una ciudad y devolver los datos estructurados al AI Agent de n8n.

> ⚠️ El guardado en PostgreSQL **no es responsabilidad del MCP** — lo hace n8n directamente con el nodo `Insert rows in a table` usando sus propias credenciales de PostgreSQL.

> 📄 Documentación completa: [`docs/explicacion_mcp.md`](./explicacion_mcp.md)

### Tool disponible: `get_weather`

El AI Agent la invoca así:
```
get_weather({ city: "Bogotá" })
```

Ejecuta 3 pasos internamente:

```
1. Geocodificación  → GET /geo/1.0/direct?q={city}       → lat, lon, country
2. Datos climáticos → GET /data/2.5/weather?lat=&lon=     → temp, condición, humedad...
3. Recomendación    → reglas por condición y sensación térmica
```

**Salida que recibe el AI Agent:**
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

**Reglas de recomendación base:**

| Condición | Recomendación |
|---|---|
| Rain / Drizzle / Thunderstorm | Usa chaqueta impermeable y lleva paraguas. |
| Haze / Mist / Fog | Usa chaqueta ligera; hay poca visibilidad. |
| feelsLike ≤ 10°C | Usa abrigo. |
| feelsLike ≤ 18°C | Usa chaqueta ligera o suéter. |
| feelsLike > 18°C | Usa ropa fresca. |

### Cómo se conecta con n8n (SSE)

```
n8n MCP Client                        MCP Server :3100
       │                                     │
       │── GET /sse ────────────────────────►│  abre canal permanente
       │◄──────────────── conexión abierta ──│
       │── descubre tools ─────────────────►│
       │◄── [ get_weather ] ────────────────│
       │── POST /messages (invoca tool) ────►│  ejecuta getWeather()
       │◄── resultado JSON ─────────────────│
```

### Endpoints del MCP Server

| Ruta | Método | Uso |
|---|---|---|
| `/sse` | GET | n8n abre la conexión SSE aquí |
| `/messages` | POST | n8n invoca tools y recibe resultados |
| `/health` | GET | Verificar que el servidor esté activo |

### Iniciar el MCP Server

```bash
cd mcp-server
npm install
cp .env.example .env    # completar con tu API key
npm start               # http://localhost:3100
```

---

## ⚙️ Workflow de n8n

El workflow exportado está en `n8n/proyecto_clima.json` y puede importarse directamente en n8n.

> 📄 Documentación completa nodo a nodo: [`docs/flujo_n8n.md`](./flujo_n8n.md)

### Nodos del workflow

| # | Nodo | Tipo | Qué hace |
|---|---|---|---|
| 1 | **Webhook** | Trigger | Recibe `city` desde el backend Spring Boot |
| 2 | **HTTP Request** | HTTP | Geocodifica ciudad → lat/lon (OpenWeatherMap /geo) |
| 3 | **HTTP Request1** | HTTP | Obtiene clima con lat/lon (OpenWeatherMap /weather) |
| 4 | **Code in JavaScript** | Código | Extrae campos y genera recomendación base |
| 5 | **AI Agent** | IA | Genera mensaje final humanizado (Groq llama-3.1-8b) |
| 6 | **Groq Chat Model** | Sub-nodo IA | Modelo de lenguaje conectado al AI Agent |
| 7 | **Insert rows in a table** | PostgreSQL | **n8n guarda directamente en la BD** |
| 8 | **Respond to Webhook** | Respuesta | Devuelve el resultado al backend |

### Diagrama de conexiones

```
[Webhook]
    │
    ▼
[HTTP Request] → geocodifica ciudad → lat/lon
    │
    ▼
[HTTP Request1] → consulta clima → temp, condition, humidity...
    │
    ▼
[Code in JavaScript] → extrae campos → genera recomendación base
    │
    ▼
[AI Agent] ◄── [Groq Chat Model]
    │   genera mensaje final humanizado (campo: output)
    ▼
[Insert rows in a table] → guarda en PostgreSQL (n8n directo)
    │
    ▼
[Respond to Webhook] → devuelve JSON al backend
```

### Prompt del AI Agent

```
Eres un asistente de clima y vestimenta.
Tu tarea es generar un mensaje corto, amable y claro para el usuario usando:
- recommended_clothes: {{ $json.recommendation }}
- temperature: {{ $json.temp }}
- weather_condition: {{ $json.condition }}

Reglas: máximo 2 oraciones, sin saludos largos, sin listas, solo el texto final.
```

### Integrar el MCP Server al workflow

1. En n8n → **Credentials → New → MCP Client**
2. **SSE URL:** `http://localhost:3100/sse`
3. Abrir el nodo **AI Agent** → **Tools → Add Tool → MCP Client**
4. n8n descubrirá automáticamente la tool `get_weather`

---

## ☕ Backend — Spring Boot

### Arquitectura por capas (Hexagonal simplificada)

```
┌────────────────────────────────────────────────────────────┐
│                      infrastructure                        │
│   controller  │  adapter  │  config  │  entity  │  repo   │
├────────────────────────────────────────────────────────────┤
│                       application                          │
│              service  │  dto  │  mapper                    │
├────────────────────────────────────────────────────────────┤
│                        domain                              │
│                  model  │  util (port)                     │
└────────────────────────────────────────────────────────────┘
```

### Clases principales

| Clase | Capa | Responsabilidad |
|---|---|---|
| `ClimatizacionApplication` | — | Entry point, levanta Spring Boot |
| `WeatherQueryController` | infrastructure | Endpoints REST en `/api/weather` |
| `N8nWebhookClient` | infrastructure | Llama al webhook de n8n con RestTemplate |
| `WeatherQueryService` | application | Casos de uso: registrar, listar, buscar |
| `weatherQueryPort` | domain | Interfaz que desacopla dominio de persistencia |
| `weatherQueryAdapter` | infrastructure | Implementación JPA del puerto |
| `weatherQueryEntity` | infrastructure | Entidad JPA mapeada a `weather_queries` |
| `weatherQuery` | domain | Modelo de dominio puro (sin anotaciones JPA) |

---

## 🖥️ Frontend — Vite + TypeScript

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # compilar para producción
npm run preview   # vista previa del build
```

Proxy de desarrollo: `/api/*` → `http://localhost:8080` (configurado en `vite.config.ts`).

---

## 🗃️ Base de datos

**Motor:** PostgreSQL serverless en **Neon**. El guardado lo gestiona **n8n** directamente con el nodo `Insert rows in a table` (credencial `proyecto_clima`).

```sql
CREATE TABLE weather_queries (
  id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  city              VARCHAR(100)   NOT NULL,
  country           VARCHAR(100)   NOT NULL,
  temperature       DECIMAL(5, 2)  NOT NULL,
  weather_condition VARCHAR(100)   NOT NULL,
  recommended_clothes TEXT         NOT NULL,
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API REST — Endpoints

**Base URL:** `http://localhost:8080/api/weather`  
**Swagger UI:** `http://localhost:8080/swagger-ui.html`

| Método | Endpoint | Descripción | Parámetros |
|---|---|---|---|
| `GET` | `/weather-advice` | Consulta clima vía n8n → MCP → OpenWeatherMap | `city` (query param) |
| `POST` | `/` | Registra una consulta manualmente en la BD | Body JSON completo |
| `GET` | `/recent` | Lista las N consultas más recientes | `limit` (default: 10) |
| `GET` | `/search` | Busca registros por ciudad o país | `query` (prefijo) |
| `GET` | `/cities` | Autocomplete de ciudades | `query` (prefijo) |
| `GET` | `/countries` | Autocomplete de países | `query` (prefijo) |

### Ejemplo — Consultar clima

```bash
curl "http://localhost:8080/api/weather/weather-advice?city=Bogota"
```

---

## 🔧 Variables de entorno

### Backend — `application.properties`

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://<host>/neondb?sslmode=require&channel_binding=require
spring.datasource.username=<usuario>
spring.datasource.password=<contraseña>
n8n.webhook.url=https://<ngrok-url>/webhook/<workflow-id>
```

### MCP Server — `.env`

```env
OPENWEATHER_API_KEY=tu_clave_de_openweathermap
MCP_PORT=3100
```

> ⚠️ Nunca subas credenciales reales al repositorio.

---

## 🚀 Cómo ejecutar el proyecto

### Prerrequisitos

- Java 17+ y Maven 3.9+ (o `./mvnw`)
- Node.js 18+
- n8n corriendo (local o en la nube)
- Cuenta en [Neon](https://neon.tech) con la BD creada
- API Key de [OpenWeatherMap](https://openweathermap.org/api)

### Orden de arranque

**1. MCP Server**
```bash
cd mcp-server
npm install
cp .env.example .env    # completar OPENWEATHER_API_KEY
npm start               # ✅ http://localhost:3100
```

**2. Backend**
```bash
./mvnw spring-boot:run          # Unix/Mac
mvnw.cmd spring-boot:run        # Windows
# ✅ http://localhost:8080
# ✅ http://localhost:8080/swagger-ui.html
```

**3. Frontend**
```bash
cd frontend && npm install && npm run dev
# ✅ http://localhost:5173
```

**4. n8n**
```
1. Importar n8n/proyecto_clima.json
2. Credentials → New → MCP Client → SSE URL: http://localhost:3100/sse
3. AI Agent → Tools → Add Tool → MCP Client → guardar
4. Activar el workflow
```

### Verificar que todo funciona

```bash
curl http://localhost:3100/health
curl "http://localhost:8080/api/weather/weather-advice?city=Bogota"
curl "http://localhost:8080/api/weather/recent?limit=5"
```

---

## 📚 Documentación adicional

| Archivo | Contenido |
|---|---|
| [`docs/flujo_n8n.md`](./flujo_n8n.md) | Explicación nodo a nodo del workflow de n8n |
| [`docs/explicacion_mcp.md`](./explicacion_mcp.md) | Qué es MCP, la tool `get_weather` y cómo se conecta con n8n |
| [`docs/ProyectoMCP_N8N.md`](./ProyectoMCP_N8N.md) | Documento de diseño: objetivos, justificación, arquitectura |
| [`mcp-server/README.md`](../mcp-server/README.md) | Instalación y uso del MCP Server |
| [`n8n/proyecto_clima.json`](../n8n/proyecto_clima.json) | Workflow exportado de n8n listo para importar |

---

## 🌿 Ramas del repositorio

| Rama | Descripción |
|---|---|
| `main` | Rama principal estable |
| `develop` | Desarrollo activo |
| `feature/conectarApi` | Feature branch para integración con API meteorológica |
| `checkout` | Rama de pruebas |

---

*Proyecto desarrollado con Spring Boot · n8n · MCP Server · Groq (Llama 3.1) · OpenWeatherMap · PostgreSQL · Vite + TypeScript*
