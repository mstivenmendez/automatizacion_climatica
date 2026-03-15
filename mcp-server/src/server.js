/**
 * MCP Server — Asistente Climático
 *
 * Expone una tool al AI Agent de n8n mediante el protocolo MCP sobre SSE (HTTP):
 *
 *   • get_weather → consulta OpenWeatherMap (geocodificación + datos climáticos)
 *
 * El guardado en PostgreSQL lo hace n8n directamente mediante el nodo
 * "Insert rows in a table" — el MCP Server no interviene en esa parte.
 *
 * Transport: SSE (Server-Sent Events) — compatible con el nodo MCP Client de n8n.
 * Puerto por defecto: 3100 (configurable con MCP_PORT en .env)
 */

import 'dotenv/config';
import { McpServer }          from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z }                  from 'zod';
import http                   from 'http';
import { getWeather }         from './tools/getWeather.js';

// ── Validaciones de entorno ───────────────────────────────────────────────────
if (!process.env.OPENWEATHER_API_KEY) {
  console.error('❌  Falta OPENWEATHER_API_KEY en .env');
  process.exit(1);
}

const PORT = Number(process.env.MCP_PORT ?? 3100);

// ── Instancia del servidor MCP ────────────────────────────────────────────────
const server = new McpServer({
  name:    'climatizacion-mcp',
  version: '1.0.0',
});

// ────────────────────────────────────────────────────────────────────────────
// Tool: get_weather
// Consulta OpenWeatherMap en tres pasos:
//   1. Geocodificación ciudad → lat/lon  (GET /geo/1.0/direct)
//   2. Datos climáticos       → temp, condición, etc. (GET /data/2.5/weather)
//   3. Recomendación base     → reglas por condición y sensación térmica
//
// El AI Agent de n8n recibe estos datos, genera el mensaje final con Groq
// y luego n8n guarda el resultado en PostgreSQL con su propio nodo Postgres.
// ────────────────────────────────────────────────────────────────────────────
server.tool(
  'get_weather',
  'Consulta el clima actual de una ciudad usando OpenWeatherMap. ' +
  'Retorna temperatura, sensación térmica, condición, descripción, ' +
  'humedad, velocidad del viento y una recomendación base de vestimenta.',
  {
    city: z.string().min(1).describe('Nombre de la ciudad a consultar (ej: "Bogotá", "Madrid")'),
  },
  async ({ city }) => {
    try {
      const data = await getWeather(city);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Servidor HTTP con SSE transport ──────────────────────────────────────────
// n8n se conecta a este servidor mediante el nodo MCP Client (SSE URL)
const transports = {};

const httpServer = http.createServer(async (req, res) => {
  // CORS — permite peticiones desde n8n (local o ngrok)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── GET /sse  — n8n abre la conexión SSE aquí ─────────────────────────────
  if (req.method === 'GET' && req.url === '/sse') {
    console.log('🔗  Nueva conexión SSE desde n8n');
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;

    res.on('close', () => {
      console.log(`🔌  Conexión SSE cerrada (session: ${transport.sessionId})`);
      delete transports[transport.sessionId];
    });

    await server.connect(transport);
    return;
  }

  // ── POST /messages  — n8n envía mensajes MCP aquí ────────────────────────
  if (req.method === 'POST' && req.url?.startsWith('/messages')) {
    const sessionId = new URL(req.url, `http://localhost`).searchParams.get('sessionId');
    const transport = transports[sessionId];

    if (!transport) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    await transport.handlePostMessage(req, res);
    return;
  }

  // ── GET /health  — endpoint de salud ─────────────────────────────────────
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      server: 'climatizacion-mcp',
      version: '1.0.0',
      tools: ['get_weather'],
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

httpServer.listen(PORT, () => {
  console.log('');
  console.log('🌤️  MCP Server — Asistente Climático');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀  Corriendo en:   http://localhost:${PORT}`);
  console.log(`🔗  SSE endpoint:   http://localhost:${PORT}/sse`);
  console.log(`💬  Messages:       http://localhost:${PORT}/messages`);
  console.log(`❤️   Health check:   http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🛠️   Tool expuesta: get_weather`);
  console.log('');
});
