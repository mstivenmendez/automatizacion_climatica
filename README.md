# Automatización Climática

## Descripción

Este proyecto es un asistente inteligente que permite consultar el clima de una ciudad y generar recomendaciones de vestimenta adecuadas basadas en las condiciones climáticas actuales. Utiliza tecnologías modernas de automatización y orquestación de flujos de datos para obtener información meteorológica en tiempo real y transformarla en recomendaciones simples y útiles.

El sistema integra:
- **Backend en Spring Boot** (Java 17) para la lógica de negocio y API REST.
- **Frontend con Vite y TypeScript** para la interfaz de usuario.
- **n8n** como plataforma de automatización de flujos.
- **MySQL** para el almacenamiento de consultas.
- **MCP (Model Context Protocol)** para estructurar la interacción con herramientas.

## Características

- Consulta del clima actual de una ciudad.
- Recomendaciones de vestimenta basadas en temperatura y condiciones climáticas.
- Almacenamiento del historial de consultas en base de datos.
- Interfaz web intuitiva.
- Integración con APIs meteorológicas externas.

## Tecnologías Utilizadas

- **Backend**: Spring Boot, Java 17, Spring Data JPA, H2 (para desarrollo), MySQL (producción)
- **Frontend**: Vite, TypeScript
- **Automatización**: n8n
- **Base de Datos**: MySQL
- **Protocolo**: MCP (Model Context Protocol)
- **Build**: Maven

## Instalación

### Prerrequisitos

- Java 17
- Node.js y npm
- Maven
- MySQL (opcional, usa H2 por defecto en desarrollo)
- n8n (para la automatización)

### Backend

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd automatizacion_climatica
   ```

2. Configura la base de datos en `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/climatizacion
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_password
   ```

3. Ejecuta el backend:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend

1. Ve al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Uso

1. Accede a la interfaz web en `http://localhost:5173` (puerto por defecto de Vite).
2. Ingresa el nombre de una ciudad.
3. Recibe la información del clima y recomendaciones de vestimenta.

## Arquitectura

- **Frontend**: Interfaz web para la interacción del usuario.
- **Backend**: API REST que maneja las solicitudes y coordina con servicios externos.
- **n8n**: Gestiona el flujo de datos entre el sistema y la API meteorológica.
- **Base de Datos**: Almacena el historial de consultas.

## Contribución

1. Fork el proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.