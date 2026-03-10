## Introducción

En la vida cotidiana, las condiciones climáticas influyen directamente en las decisiones que toman las personas antes de salir de casa, especialmente en la elección de la vestimenta adecuada. Sin embargo, muchas veces los usuarios consultan aplicaciones meteorológicas que muestran datos técnicos como temperatura, humedad o probabilidad de lluvia, pero no ofrecen recomendaciones claras sobre cómo interpretar esa información para decidir qué ropa utilizar.

Este proyecto propone el desarrollo de un **asistente inteligente que permita consultar la temperatura de una ciudad y generar recomendaciones de vestimenta adecuadas según las condiciones climáticas actuales**. La solución integrará tecnologías modernas de automatización y orquestación de flujos de datos para obtener información meteorológica en tiempo real y transformarla en recomendaciones simples y útiles para el usuario.

Para la implementación del sistema se utilizará **n8n como plataforma de automatización de flujos**, **MySQL como sistema de gestión de base de datos** para almacenar las consultas realizadas, y **MCP (Model Context Protocol)** para estructurar la interacción con herramientas y servicios que procesen la información climática. Además, el sistema se conectará a una **API meteorológica externa** que proporcionará los datos necesarios para analizar las condiciones del clima.

El sistema permitirá que un usuario introduzca el nombre de una ciudad y reciba información sobre la temperatura actual, las condiciones climáticas y una recomendación clara sobre el tipo de vestimenta más adecuada, como ropa ligera, chaqueta, abrigo o el uso de paraguas en caso de lluvia.

Con este proyecto se busca demostrar cómo la integración de **automatización, APIs externas y sistemas de almacenamiento de datos** puede facilitar la creación de asistentes inteligentes que simplifiquen la interpretación de información técnica y la transformen en recomendaciones prácticas para los usuarios.

# 1. Planteamiento del problema

En la actualidad, muchas personas consultan aplicaciones meteorológicas para conocer las condiciones climáticas antes de salir de casa. Sin embargo, estas aplicaciones generalmente presentan información técnica como temperatura, humedad, velocidad del viento o probabilidad de lluvia, lo cual puede resultar poco intuitivo para algunos usuarios al momento de decidir qué tipo de vestimenta utilizar.

Aunque los datos climáticos están disponibles, los usuarios deben interpretar esa información por sí mismos para determinar si deben usar ropa ligera, una chaqueta, un abrigo o llevar paraguas. Esta interpretación puede ser confusa, especialmente cuando existen factores como sensación térmica, cambios repentinos de clima o condiciones como viento y lluvia.

Ante esta situación, surge la necesidad de desarrollar una herramienta que no solo proporcione datos meteorológicos, sino que también **interprete automáticamente la información climática y genere recomendaciones claras sobre la vestimenta más adecuada** para el usuario.

Por lo tanto, se propone el desarrollo de un **asistente inteligente capaz de consultar el clima de una ciudad y sugerir recomendaciones de vestimenta basadas en la temperatura y las condiciones climáticas actuales**, utilizando tecnologías modernas de integración y automatización como **n8n, MCP y bases de datos MySQL**.

------

# 2. Objetivo general

Desarrollar un asistente inteligente que consulte las condiciones climáticas de una ciudad y genere recomendaciones de vestimenta adecuadas utilizando automatización de flujos con **n8n**, almacenamiento de datos en **MySQL** e integración de herramientas mediante **Model Context Protocol (MCP)**.

------

# 3. Objetivos específicos

1. Diseñar una interfaz que permita al usuario ingresar el nombre de una ciudad para consultar el clima.
2. Integrar una API meteorológica que proporcione información actualizada sobre temperatura y condiciones climáticas.
3. Implementar un flujo de automatización utilizando **n8n** para procesar la información climática.
4. Desarrollar reglas de decisión que permitan generar recomendaciones de vestimenta basadas en la temperatura y las condiciones del clima.
5. Implementar una base de datos **MySQL** para almacenar el historial de consultas realizadas.
6. Integrar **MCP (Model Context Protocol)** para estructurar el acceso a herramientas que consulten el clima y generen recomendaciones.
7. Mostrar al usuario recomendaciones claras y fáciles de interpretar.

------

# 4. Justificación

El desarrollo de herramientas inteligentes que faciliten la interpretación de datos es cada vez más relevante en el contexto de la transformación digital. En el caso de las aplicaciones meteorológicas, aunque existe una gran cantidad de información disponible, los usuarios muchas veces necesitan recomendaciones simples que les ayuden a tomar decisiones rápidas.

Este proyecto busca demostrar cómo la integración de tecnologías modernas como **automatización de flujos, APIs externas y bases de datos** puede mejorar la experiencia del usuario al transformar datos técnicos en recomendaciones prácticas.

Además, el proyecto tiene un valor académico y tecnológico al permitir aplicar conceptos relacionados con:

- integración de APIs
- automatización de procesos
- diseño de sistemas distribuidos
- almacenamiento de datos
- desarrollo de asistentes inteligentes

El uso de herramientas como **n8n y MCP** también permite construir soluciones modulares y escalables que pueden ampliarse en el futuro para incluir nuevas funcionalidades, como predicciones climáticas, recomendaciones personalizadas o integración con asistentes virtuales.

------

# 5. Alcance del proyecto

El sistema permitirá:

- Consultar el clima actual de una ciudad.
- Obtener temperatura y condiciones climáticas.
- Procesar la información mediante reglas de decisión.
- Generar recomendaciones de vestimenta.
- Guardar el historial de consultas en una base de datos.

El proyecto no incluirá inicialmente:

- predicciones climáticas a largo plazo
- personalización avanzada por usuario
- integración con dispositivos móviles o asistentes de voz

Estas funcionalidades podrían implementarse en versiones futuras.

------

# 6. Arquitectura del sistema

La arquitectura del sistema estará compuesta por varios componentes que interactúan entre sí para procesar la información climática y generar recomendaciones.

### Componentes principales

**Frontend**

- Interfaz web donde el usuario ingresa la ciudad y visualiza la recomendación.

**Backend**

- API que recibe las solicitudes del usuario y coordina la comunicación con otros servicios.

**n8n**

- Plataforma de automatización que gestiona el flujo de datos entre el sistema y la API meteorológica.

**Servidor MCP**

- Expone herramientas que permiten consultar el clima y generar recomendaciones de vestimenta.

**Base de datos MySQL**

- Almacena el historial de consultas realizadas por los usuarios.

### Flujo del sistema

1. El usuario ingresa una ciudad en la interfaz web.
2. El frontend envía la solicitud al backend.
3. El backend activa un flujo en n8n.
4. n8n consulta una API meteorológica externa.
5. Se procesan los datos climáticos.
6. Se generan recomendaciones de vestimenta.
7. La información se guarda en MySQL.
8. El sistema devuelve la recomendación al usuario.

------

# 7. Metodología de desarrollo

Para el desarrollo del proyecto se utilizará una metodología incremental que permita construir y probar cada componente del sistema de manera progresiva.

Las etapas principales del desarrollo serán:

1. **Análisis del problema**
   - Identificación de necesidades del usuario.
   - Definición de funcionalidades del sistema.
2. **Diseño del sistema**
   - Definición de la arquitectura.
   - Diseño de base de datos.
   - Definición de flujos de automatización.
3. **Implementación**
   - Desarrollo del backend.
   - Configuración de n8n.
   - Integración con API meteorológica.
   - Implementación de MCP.
   - Creación de base de datos MySQL.
4. **Pruebas**
   - Validación del flujo completo del sistema.
   - Verificación de recomendaciones generadas.
5. **Documentación**
   - Elaboración de documentación técnica del proyecto.

------

# 8. Workflow de n8n paso a paso

**Opción recomendada**

Usar n8n como orquestador central.

**Nodos sugeridos**

**1. Webhook**

- Recibe `city`

**2. HTTP Request**

- Consulta la API meteorológica
- Ejemplo:
  - OpenWeatherMap
  - WeatherAPI

**3. Function / Code**

- Extrae:
  - temperatura
  - clima
  - sensación térmica
- Aplica reglas de recomendación

**4. MySQL**

- Inserta el registro en la base de datos

**5. Respond to Webhook**

- Devuelve JSON al frontend

## Ejemplo de lógica en n8n

```
const temp = $json.temperature;
const condition = ($json.condition || "").toLowerCase();

let recommendation = "";

if (temp < 10) {
  recommendation = "Usa abrigo grueso, bufanda y pantalón largo.";
} else if (temp >= 10 && temp < 18) {
  recommendation = "Usa chaqueta ligera o suéter.";
} else if (temp >= 18 && temp < 26) {
  recommendation = "Usa ropa cómoda de media estación.";
} else {
  recommendation = "Usa ropa ligera y fresca.";
}

if (condition.includes("rain") || condition.includes("lluvia")) {
  recommendation += " Lleva paraguas o impermeable.";
}

return [{
  json: {
    city: $json.city,
    temperature: temp,
    condition: $json.condition,
    recommendation
  }
}];
```

------

## Diseño de base de datos MySQL

### Tabla principal

```
CREATE TABLE weather_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    weather_condition VARCHAR(100) NOT NULL,
    recommended_clothes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla opcional de usuarios

Si luego quieres autenticación:

```
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relación opcional

```
ALTER TABLE weather_queries
ADD COLUMN user_id INT NULL,
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id);
```

------

## MCP Server propuesto

### Herramientas

Tu servidor MCP puede exponer dos tools:

#### 1. `get_weather`

Entrada:

```
{
  "city": "Bogotá"
}
```

Salida:

```
{
  "city": "Bogotá",
  "temperature": 14,
  "condition": "Nublado"
}
```

#### 2. `recommend_outfit`

Entrada:

```
{
  "temperature": 14,
  "condition": "Nublado"
}
```

Salida:

```
{
  "recommendation": "Usa chaqueta ligera o suéter."
}
```

------

## Estructura de carpetas sugerida

```
weather-outfit-assistant/
│
├──frontend/
│
│   ├──index.html
│   ├──styles.css
│   └── script.js
│
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   │
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── weatherassistant/
│       │   │
│       │   │           ├── WeatherAssistantApplication.java
│       │   │
│       │   │           ├── controller/
│       │   │           │   └── WeatherController.java
│       │   │
│       │   │           ├── service/
│       │   │           │   └── WeatherService.java
│       │   │
│       │   │           ├── repository/
│       │   │           │   └── WeatherQueryRepository.java
│       │   │
│       │   │           ├── model/
│       │   │           │   └── WeatherQuery.java
│       │   │
│       │   │           ├── dto/
│       │   │           │   ├── WeatherRequestDTO.java
│       │   │           │   └── WeatherResponseDTO.java
│       │   │
│       │   │           ├── client/
│       │   │           │   └── WeatherApiClient.java
│       │   │
│       │   │           ├── util/
│       │   │           │   └── ClothingRecommendationUtil.java
│       │   │
│       │   │           └── config/
│       │   │               ├── RestTemplateConfig.java
│       │   │               └── CorsConfig.java
│       │   │
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── schema.sql
│       │       └── data.sql
│       │
│       └── test/
│           └── java/
│               └── com/
│                   └── weatherassistant/
│                       └── WeatherAssistantApplicationTests.java
│
├── mcp-server/
│   ├── src/
│   │   ├── tools/
│   │   │   ├── getWeather.js
│   │   │   └── recommendOutfit.js
│   │   └── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── docs/
    ├── architecture.md
    ├── api-spec.md
    └── system-design.md
```

------

## Stack recomendado

### Frontend

- React
- Vite
- Tailwind CSS
- Axios o Fetch

### Backend

- Java+Springboot

### Orquestación

- n8n

### Base de datos

- MySQL

### MCP

- Node.js para construir el servidor MCP

------

# index.html

```
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Asistente de vestimenta por clima</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <div class="container">
    <h1>Asistente de vestimenta por clima</h1>

    <div class="form">
      <input 
        type="text"
        id="cityInput"
        placeholder="Escribe una ciudad"
      >
      <button onclick="consultWeather()">Consultar</button>
    </div>

    <div id="result" class="result hidden">
      <h2 id="city"></h2>
      <p id="temperature"></p>
      <p id="condition"></p>
      <p id="recommendation"></p>
    </div>

  </div>

  <script src="script.js"></script>

</body>
</html>
```

------

# styles.css

```
body {
  font-family: Arial, Helvetica, sans-serif;
  background-color: #f4f6f8;
  display: flex;
  justify-content: center;
  margin-top: 80px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
}

.form {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 10px 15px;
  border: none;
  background-color: #0077ff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #005fd1;
}

.result {
  margin-top: 20px;
}

.hidden {
  display: none;
}
```

------

# script.js

```
async function consultWeather() {

  const city = document.getElementById("cityInput").value;

  if (!city) {
    alert("Por favor ingresa una ciudad");
    return;
  }

  try {

    const response = await fetch("http://localhost:3001/api/weather-outfit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city: city })
    });

    const data = await response.json();

    document.getElementById("city").textContent = data.city;
    document.getElementById("temperature").textContent =
      "Temperatura: " + data.temperature + "°C";

    document.getElementById("condition").textContent =
      "Condición: " + data.condition;

    document.getElementById("recommendation").textContent =
      "Recomendación: " + data.recommendation;

    document.getElementById("result").classList.remove("hidden");

  } catch (error) {

    console.error(error);
    alert("Error al consultar el clima");

  }
}
```

------

# Estructura del frontend

```
frontend/
│
├── index.html
├── styles.css
└── script.js
```

### MCP Server base

```
import express from "express";

const app = express();
app.use(express.json());

app.post("/tool/get_weather", async (req, res) => {
  const { city } = req.body;

  res.json({
    city,
    temperature: 16,
    condition: "Nublado"
  });
});

app.post("/tool/recommend_outfit", async (req, res) => {
  const { temperature, condition } = req.body;

  let recommendation = "";

  if (temperature < 10) {
    recommendation = "Usa abrigo grueso.";
  } else if (temperature < 18) {
    recommendation = "Usa chaqueta ligera.";
  } else if (temperature < 26) {
    recommendation = "Usa ropa cómoda.";
  } else {
    recommendation = "Usa ropa fresca.";
  }

  if ((condition || "").toLowerCase().includes("lluvia")) {
    recommendation += " Lleva paraguas.";
  }

  res.json({ recommendation });
});

app.listen(4000, () => {
  console.log("MCP server running on port 4000");
});
```

------

## Reglas de recomendación sugeridas

Puedes comenzar con reglas simples:

- **Menos de 10°C** → abrigo, bufanda, pantalón largo
- **10°C a 17°C** → chaqueta o suéter
- **18°C a 25°C** → ropa cómoda
- **Más de 25°C** → ropa ligera
- **Lluvia** → paraguas o impermeable
- **Viento fuerte** → chaqueta cortavientos

